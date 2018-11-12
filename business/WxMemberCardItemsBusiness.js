/**
 * Created by Administrator on 2018/4/24.
 */
const _ = require('lodash');
const moment = require('moment');
const devUtils = require('develop-utils');
const restRouterModel = require('rest-router-model');
let BaseBusiness = restRouterModel.BaseBusiness;
let getSchema = restRouterModel.getSchema;
const config = require('../config/config');
const inflection = require( 'inflection' );
const cacheAble = require('componet-service-framework').cacheAble;
const redis = require('../common/redis');
let parse = restRouterModel.parse;

const utils = require('componet-service-framework').utils;
const resourceURI = require('../common/resourceURI');
const URIParser = resourceURI.v1;
const request = require('common-request').request;
const ResourceNameType = require('../proxy/baseProxyFactory').ResourceNameType;
const memberProxy = require('../proxy/baseProxyFactory').getResourceProxy(ResourceNameType.Resource_Members);
const memberGradeProxy = require('../proxy/baseProxyFactory').getResourceProxy(ResourceNameType.Resource_MemberGrades);
const wxMsgRecver = require('../wxService/WxMsgRecver');
const wxConstantConfig = require('../wxUtils/wxConstantConfig');

const wxAccessTokenUtils = require('../wxService/WxAccessTokenUtils');
const wxRequest = require('../wxUtils/wxRequest').wxRequest;

const BaseProxyTranction = require('componet-service-framework').baseProxyTranction;

const ownerMemberMsgRecver = require('./OwnerMemberMsgRecver');
const wxMemberService = require('../wxService/WxMemberService').handler;
const wxUserService = require('../wxService/WxUserService');
const wxMessageService = require('../wxService/WxMessageService');

const authWxLoginProxy = require('../proxy/baseProxyFactory').getResourceProxy(ResourceNameType.Resource_AuthWxLogins);
const qs = require('querystring');

class WxMemberCardItemsBusiness extends BaseBusiness
{
    constructor()
    {
        super();
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.userGotCardEvent,this.handleGetCardEvent,this);
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.userActiveCardEvent,this.handleSubmitEvent,this);
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.userDelCardEvent,this.handleDeleteEvent,this);
        ownerMemberMsgRecver.setEventHandler(this.handleMemberChangeEvent,this);
        this.amountServiceType = {
            consume:'扣值消费',
            recharge:'充值消费',
            refund:'退款交易',
        };

        this.countServiceType = {
            consume:'扣次消费',
            recharge:'充次消费',
            refund:'退次交易',
        };

    }

    async handleMemberChangeEvent(data)
    {
        let  needPushModule = false, openId ='',shopName = '',mobile = '',ownerCardUUID='',wxCardId='',merchantUUID = '';
/*        try
        {*/
            let updateMemberRet =  await this.updateMemberBalance({body:data});
            needPushModule = updateMemberRet.needPushModule;
            openId = updateMemberRet.openId;
            shopName = updateMemberRet.shopName;
            mobile = updateMemberRet.mobile;
            ownerCardUUID = updateMemberRet.ownerCardUUID;
            wxCardId = updateMemberRet.wxCardId;
            merchantUUID  = updateMemberRet.merchantUUID;

            if(!updateMemberRet.ret)
            {
                console.log('WxMemberCardItemsBusiness->handleMemberChangeEvent  updateMemberBalance ret false!!!' );
                return true;
            }

            if(_.isEmpty(data.tradeType) || !this.amountServiceType[data.tradeType])
            {
                console.log(`WxMemberCardItemsBusiness->handleMemberChangeEvent  tradeType is not valid:${data.tradeType}!!!`);
                return true;
            }



            if(needPushModule)
            {

                let weiCard = mobile.substr(mobile.length-4);

                let consumeType = (data.cardType == 'amount') ? this.amountServiceType[data.tradeType] : this.countServiceType[data.tradeType];
                let title = `您的尾号${weiCard}帐户于${shopName}${consumeType}如下:`;
                let consumeAt = data.tradeAt;
                let consumeAmount,leftAmount,consumeRemark;
                let remark = '谢谢光临,感谢再次使用！';
                let clickUrl = '';
                let clickQs = {ownerCardUUID,card_id:wxCardId};

                let clickParams = '?' + qs.stringify(clickQs);

                if(data.tradeType == 'consume')
                {
                    clickUrl = config.wxPublicNoInfo.memberCard.payCard_url + clickParams;
                }
                else  if(data.tradeType == 'recharge')
                {
                    clickUrl = config.wxPublicNoInfo.memberCard.rechargeCard_url + clickParams;
                }
                else
                {
                    clickUrl = config.wxPublicNoInfo.memberCard.payCard_url + clickParams;
                }

                console.log(`WxMemberCardItemsBusiness->handleMemberChangeEvent  wxUser has subscribe publicNo,will send module msg clickUrl=${clickUrl}.` );

                if(data.cardType == 'amount')
                {
                    if(data.tradeType == 'consume')
                    {
                        consumeAmount = `${data.tradeValue/100.0}元`;
                        leftAmount = `${data.leftValue/100.0}元`;
                        consumeRemark = '-';
                    }
                    else  if(data.tradeType == 'recharge')
                    {
                        consumeAmount = `充${data.tradeValue/100.0}元(另赠${data.rechargeDetails.giveAmount/100.0})`;
                        leftAmount = `${data.leftValue/100.0}元`;
                        consumeRemark = `你购买了(${data.rechargeDetails.rechargeTaoCanName})的充值套餐。`;
                    }
                    else
                    {
                        consumeAmount = `退${data.tradeValue/100.0}元`;
                        leftAmount = `${data.leftValue/100.0}元`;
                        consumeRemark = '-';
                    }
                }
                else
                {
                    if(data.tradeType == 'consume')
                    {
                        consumeAmount = `${data.tradeValue}次`;
                        leftAmount = `${data.leftValue}次`;
                        let consumeDetails = data.consumeDetails.map(consumeItem=>`${consumeItem.name}(扣${consumeItem.tradeValue}次，余${consumeItem.leftValue}次)`);
                        consumeRemark = _.join(consumeDetails,',');
                        consumeRemark += '。';
                    }
                    else  if(data.tradeType == 'recharge')
                    {
                        consumeAmount = `充${data.rechargeDetails.rechargeAmount/100.0}元(${data.tradeValue}次)`;
                        leftAmount = `${data.leftValue}次`;
                        consumeRemark = `你购买了(${data.rechargeDetails.rechargeTaoCanName})的充次套餐。`;
                    }
                    else
                    {
                        consumeAmount = `退${data.tradeValue}次`;
                        leftAmount = `${data.leftValue}次`;
                        let refundDetails = data.consumeDetails.map(consumeItem=>`${consumeItem.name}(退${consumeItem.tradeValue}次，余${consumeItem.leftValue}次)`);
                        consumeRemark = _.join(refundDetails,',');
                        consumeRemark += '。';
                    }
                }

                let sendTemplateRet = await wxMessageService.sendConsumeTemplateMsg(
                    {openId,title,consumeAt,consumeType,consumeAmount,leftAmount,consumeRemark,remark,clickUrl},merchantUUID);
                console.log('WxMemberCardItemsBusiness->handleMemberChangeEvent sendTemplateRet:' + JSON.stringify(sendTemplateRet,null,2));

            }
       /* }
        catch (e)
        {
            console.error(' WxMemberCardItemsBusiness->handleMemberChangeEvent  error, e:' + e );
            return false;
        }*/

        return true;
    }

    async saveMemberCardItemData(data)
    {
        let saveCardItemObj;
        let wxMemcardItemRes =  await this.models['wxMemberCardItem'].listAll({wxCardId:data.wxCardId,openId:data.openId});
        if(wxMemcardItemRes.items.length > 0)
        {
            data.uuid = wxMemcardItemRes.items[0].uuid;
            data.modifiedAt = utils.getTimeStr(new Date(),true);
            console.log('WxMemberCardItemsBusiness->saveMemberCardItemData->has exist update data:' + JSON.stringify(data,null,2));
            saveCardItemObj = await this.models['wxMemberCardItem'].update(data);
        }
        else
        {
            data = parse(this.resourceConfig,'wxMemberCardItem',data);
            console.log('WxMemberCardItemsBusiness->saveMemberCardItemData->not exist create data:' + JSON.stringify(data,null,2));
            saveCardItemObj = await this.models['wxMemberCardItem'].create(data);
        }
        return saveCardItemObj;
    }

    async handleGetCardEvent(data,query)
    {
        let memberCardItemData = {
            wxCardId:data.CardId,
            unionId:data.UnionId,
            wxMemberCardCode:data.UserCardCode,
            wxMemberShipNo:data.UserCardCode,
            openId:data.FromUserName,
            status:'normal',
            //isActived:0,
        };
        await this.saveMemberCardItemData(memberCardItemData);

        return true;
    }

    async handleDeleteEvent(data,query)
    {
        let memberCardItemData = {
            wxCardId:data.CardId,
            openId:data.FromUserName,
            status:'deleted',
        };
        await this.saveMemberCardItemData(memberCardItemData);

        return true;
    }

    async syncWxToInsideMember(data)
    {
        let wxMemberCardRes = await this.models['wxMemberCard'].listAll({wxCardId:data.wxCardId});
        if(wxMemberCardRes.items.length <= 0)
        {
            let errorData = ('WxMemberCardItemsBusiness->syncWxToInsideMember not find wxMemberCard Info by wxCardId:' + data.wxCardId);
            console.error(errorData);
            throw new Error(errorData);
        }
        let merchantUUID = wxMemberCardRes.items[0].merchantUUID;

        /** 2018/9/19  统一在获取微信会员卡用户详情接口内部进行转换。
         lpy-modifyed  */
        /*  function getFieldValue(fieldName) {
              let mobileObj = _.find(wxMemberCardDetailObjs.user_info.common_field_list, fieldItem=>_.isEqual(fieldItem.name,fieldName));
              return mobileObj ? mobileObj.value : '';
          }

          let mobile = getFieldValue('USER_FORM_INFO_FLAG_MOBILE');
          let name = getFieldValue('USER_FORM_INFO_FLAG_NAME');
          let birthday = getFieldValue('USER_FORM_INFO_FLAG_BIRTHDAY');
          let sex = (wxMemberCardDetailObjs.sex == 'MALE') ? 1 : 0;
  */

        let mobile = data.mobile;
        let name = data.name;
        let birthday = _.isEmpty(data.birthday) ? null : data.birthday;
        let sex = (data.sex == '男') ? 1 : 0;

        let sexStr = (sex == 1) ? 'male' : 'female';

        let oldMemberRes = await memberProxy.listAll({shopUUID:merchantUUID,mobile:mobile,status:'enabled'});

        let memberData= {};
        let ownerMemberCardId;

        let isNewMember = 0;

        if(oldMemberRes.items.length <= 0)
        {
            let defMemberGradeObj = await memberGradeProxy.listAll({shopUUID:merchantUUID,isDefault:1});
            let createMemberData = {
                shopUUID:merchantUUID,
                mobile:mobile,
                name:name,
                sex:sexStr,
                birthday:birthday,
                openedDate:utils.getDateStr(new Date(),true),
                memberGradeUUID:defMemberGradeObj.items[0].uuid,
                source: "weixin",
                weixinCardNumber:data.code,
            };
            memberData = await memberProxy.create(createMemberData);
            ownerMemberCardId = memberData.number;
            console.error('WxMemberCardItemsBusiness->syncWxToInsideMember not find owner member by mobile :' + mobile + ', create!!! '
                + ',ownerMemberCardId:' + ownerMemberCardId +
                ',memberData :' + JSON.stringify(memberData,null,2));

            isNewMember = 1;
        }
        else
        {
            let updateMemberData = {
                mobile:mobile,
                name:name,
                sex:sexStr,
                birthday:birthday,
                weixinCardNumber:data.code,
            };
            memberData = await memberProxy.update(oldMemberRes.items[0].href,updateMemberData);
            ownerMemberCardId = oldMemberRes.items[0].number;
            memberData = oldMemberRes.items[0];
            console.error('WxMemberCardItemsBusiness->syncWxToInsideMember  find owner member by mobile :' + mobile + ', update!!! '
                + ',ownerMemberCardId:' + ownerMemberCardId +
                ',memberData :' + JSON.stringify(memberData,null,2));
            isNewMember = 0;
        }

        let memberCardItemData = {
            wxCardId:data.wxCardId,
            wxMemberCardCode:data.code,
            wxMemberShipNo:data.code,
            openId:data.openId,
           // nickname:data.nickname,
            sex: sex,
            mobile:mobile,
            name:name,
            birthday:birthday,
            status:'normal',
            isActived:data.isActived,
            ownerCardId:ownerMemberCardId,
            ownerCardUUID:memberData.uuid,
        };

        await this.saveMemberCardItemData(memberCardItemData);

        memberData.isNewMember = isNewMember;
        memberData.shopName = wxMemberCardRes.items[0].brandName;

        return memberData;

    }


    async handleSubmitEvent(data,query)
    {
        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:data.CardId});
        let wxMemberCardDetailObjs = await wxMemberService.getWxMemberCardDetailsInfo(data.CardId,data.UserCardCode,
            wxMemberCardObj.items[0].merchantUUID);

        wxMemberCardDetailObjs.wxCardId = data.CardId;
        wxMemberCardDetailObjs.code  = data.UserCardCode;
        wxMemberCardDetailObjs.openId  = data.FromUserName;
        wxMemberCardDetailObjs.isActived  = 1;

        await  this.syncWxToInsideMember(wxMemberCardDetailObjs);
        return true;
    }



    /** 2018/9/19  更新会员卡个人积分信息。
     lpy-modifyed  */
    async updateMemberBonus(content,ctx)
    {
        let data = content.body;
        let wxMemberCardItemObj = await this.model.listAll({ownerCardId:data.ownerCardId});
        if(wxMemberCardItemObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBonus not found wxMemberCardItem error ' +
                +',wxMemberCardItemObj :' + JSON.stringify(wxMemberCardItemObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }
        let openId = wxMemberCardItemObj.items[0].openId;
        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:wxMemberCardItemObj.items[0].wxCardId});
        if(wxMemberCardObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBonus not found wxMemberCard error ' +
                +',wxMemberCardObj :' + JSON.stringify(wxMemberCardObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }

        let ownerMemberRes = await memberProxy.listAll({number:data.ownerCardId});
        if(ownerMemberRes.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBonus not found owner member error ' +
                +',ownerMemberRes :' + JSON.stringify(ownerMemberRes,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }
        let ownerMemberGradeObj = await memberGradeProxy.listAll({uuid:ownerMemberRes.items[0].memberGradeUUID});
        if(ownerMemberGradeObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBonus not found owner member grade error ' +
                +',ownerMemberGradeObj :' + JSON.stringify(ownerMemberGradeObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }

        let wxBackGroudUrl =  await this.businesses['wxImage'].uploadImage(ownerMemberGradeObj.items[0].backgroundPictureURL
        ,wxMemberCardObj.items[0].merchantUUID);

        let updateMemberCardData ={
            "code": wxMemberCardItemObj.items[0].wxMemberCardCode,
            "card_id": wxMemberCardItemObj.items[0].wxCardId,
            "background_pic_url": wxBackGroudUrl,
            "record_bonus": ''/*data.recordBonus*/,  //"消费20元，获得20积分"
            "bonus": data.bonus,
            "add_bonus": data.addBonus,
            "notify_optional":
             {
                 "is_notify_bonus": false,
             }
        };
        let updateMemberObj = await wxMemberService.updateMemberCard(updateMemberCardData,wxMemberCardObj.items[0].merchantUUID);
        return updateMemberObj;
    }

    /** 2018/9/19  更新会员卡个人余额和等级等自定义信息，并自动推送系统模板或者公众号模板消息。
     lpy-modifyed  */
    async updateMemberBalance(content,ctx)
    {
        let data = content.body;
        let wxMemberCardItemObj = await this.model.listAll({ownerCardId:data.ownerCardId});
        if(wxMemberCardItemObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBalance not found wxMemberCardItem error ' +
           ',wxMemberCardItemObj :' + JSON.stringify(wxMemberCardItemObj,null,2);
            console.error(errorData);
            return {ret:false};
            //throw new Error(errorData);
        }
        let openId = wxMemberCardItemObj.items[0].openId;
        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:wxMemberCardItemObj.items[0].wxCardId});
        if(wxMemberCardObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->updateMemberBalance not found wxMemberCard error ' +
                +',wxMemberCardObj :' + JSON.stringify(wxMemberCardObj,null,2);
            console.error(errorData);
            return {ret:false};
        }

        let wxUserInfo = await wxUserService.getWxUserInfo(openId,wxMemberCardObj.items[0].merchantUUID);
        let bSubcribed = false;
        if(wxUserInfo && wxUserInfo.subscribe ==1)
        {
            bSubcribed = true;
        }

        let updateMemberCardData ={
            "code": wxMemberCardItemObj.items[0].wxMemberCardCode,
            "card_id": wxMemberCardItemObj.items[0].wxCardId,
            "notify_optional": {},
        };
        if(data.cardType == 'amount')
        {
            updateMemberCardData['custom_field_value1'] = `${data.leftValue/100.0}元`;
            updateMemberCardData.notify_optional.is_notify_custom_field1 = !bSubcribed;
        }
        else
        {
            updateMemberCardData['custom_field_value2'] = `${data.leftValue}次`;
            updateMemberCardData.notify_optional.is_notify_custom_field2 = !bSubcribed;
        }

        try {
            let updateMemberObj = await wxMemberService.updateMemberCard(updateMemberCardData,wxMemberCardObj.items[0].merchantUUID);
        }
        catch (e)
        {
            let errorObj = JSON.parse(e.message);
            if(errorObj.body.errcode == 40127)
            {
                console.warn('WxMemberCardItemsBusiness->updateMemberBalance  wxUserCard is deleted ,will break!!');
            }
            else
            {
                throw new Error(e);
            }
        }

        return {
            ret:true,
            needPushModule:bSubcribed,
            openId:openId,
            shopName:wxMemberCardObj.items[0].brandName,
            mobile:wxMemberCardItemObj.items[0].mobile,
            ownerCardUUID:wxMemberCardItemObj.items[0].ownerCardUUID,
            wxCardId:wxMemberCardItemObj.items[0].wxCardId,
            merchantUUID:wxMemberCardObj.items[0].merchantUUID,
        };
    }

/*    async sendConsumeTemplateMsg(content,ctx)
    {
        return wxMemberService.sendConsumeTemplateMsg(content.body);
    }*/

/*    async getWxUserInfoByActiveTicket(content,ctx)
    {
        return await wxMemberService.getWxUserInfoByActiveTicket(ctx.method == 'GET' ? content.query : content.body);
    }*/


    async syncOwnerMember(content,ctx)
    {
        let data = content.body;

        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:data.wxCardId});
        let merchantUUID = wxMemberCardObj.items[0].merchantUUID;
        content.body.merchantUUID = merchantUUID;

        let wxUserInfo = await wxMemberService.getWxUserInfoByActiveTicket(content,ctx);
        data = _.extend(data,wxUserInfo);
        data.isActived = 0;
        data.code = await wxMemberService.decodeCode({encryptCode:data.encryptCode},merchantUUID);

        let ownerMemberData = await this.syncWxToInsideMember(data);

        let leftCount = 0 ;
        ownerMemberData.countItems.map(countItem=>{
           if(countItem.isCountLimit == 1)
           {
               leftCount += countItem.count;
           }
        });

        return {
            mobile:wxUserInfo.mobile,
            name:wxUserInfo.name,
            sex:wxUserInfo.sex,
            birthday:wxUserInfo.birthday,
            ownerMemberCardId:ownerMemberData.number,
            leftCount:leftCount,
            balance:ownerMemberData.amount,
            code:data.code,
            isNewMember:ownerMemberData.isNewMember,
            shopName:ownerMemberData.shopName,
        };
    }

    async activeWxMemberCard(content,ctx)
    {
        let data = content.body;



      /*  if(data.activate_ticket)
        {
            let wxUserInfo = await this.getWxUserInfoByActiveTicket({body:{activate_ticket:data.activate_ticket}});
        }*/

        let wxMemcardItemRes =  await this.models['wxMemberCardItem'].listAll({wxCardId:data.wxCardId,openId:data.openId});

        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:data.wxCardId});

        if(data.encryptCode && !data.code)
        {
            data.code = await wxMemberService.decodeCode({encryptCode:data.encryptCode},wxMemberCardObj.items[0].merchantUUID);
        }

        let knex = this.dbOperater;

        let curCtx = this;

        return knex.transaction(async function (trx) {

            let memberCardItemData = {
                wxCardId:data.wxCardId,
                openId:data.openId,
                wxMemberCardCode:data.code,
                wxMemberShipNo:data.code,
                ownerCardId:data.ownerMemberCardId,
                isActived:1,
               // nickname:data.nickname,
               // sex: data.sex,
               // mobile:data.mobile,
               // name:data.name,
               // birthday:data.birthday,
                //status:'normal',

            };

            let saveCardItemObj;
            if(wxMemcardItemRes.items.length > 0)
            {
                memberCardItemData.uuid = wxMemcardItemRes.items[0].uuid;
                memberCardItemData.modifiedAt = utils.getTimeStr(new Date(),true);
                console.log('WxMemberCardItemsBusiness->activeWxMemberCard->has exist update data:' + JSON.stringify(memberCardItemData,null,2));
                saveCardItemObj =await  knex('WxMemberCardItems').update(memberCardItemData).where('uuid', memberCardItemData.uuid).transacting(trx);
            }
            else
            {
                memberCardItemData = parse(curCtx.resourceConfig,'wxMemberCardItem',memberCardItemData);
                console.log('WxMemberCardItemsBusiness->activeWxMemberCard->not exist create data:' + JSON.stringify(memberCardItemData,null,2));
                saveCardItemObj = await  knex('WxMemberCardItems').insert(memberCardItemData).transacting(trx);
            }

            let activeData = {
                "membership_number": data.code,
                "code": data.code,
                init_custom_field_value1:`${data.balance/100.0}元`,
                init_custom_field_value2:`${data.leftCount}次`,
            };

            let wxActiveInfoRet = await wxMemberService.activeWxMemberCard(activeData,wxMemberCardObj.items[0].merchantUUID);
            return wxActiveInfoRet;
        });
    }


    async findOwnerMemberByWxData(content,ctx)
    {
        let data = content.query;
        let wxCardItemQS = {wxCardId:data.wxCardId};
        if(!_.isEmpty(data.ownerCardUUID))
        {
            wxCardItemQS.ownerCardUUID = data.ownerCardUUID;
        }
        else
        {
            wxCardItemQS.openId = data.openId;
        }

        let wxMemcardItemRes =  await this.models['wxMemberCardItem'].listAll(wxCardItemQS);
        if(wxMemcardItemRes.items.length <= 0 )
        {
            let errorData = 'WxMemberCardItemsBusiness->findOwnerMemberByWxData not found wxMemberCardItem by wxCardid and openid error ' +
                ',wxMemcardItemRes :' + JSON.stringify(wxMemcardItemRes,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }
        let wxMemberCardObj = await this.models['wxMemberCard'].listAll({wxCardId:data.wxCardId});
        if(wxMemberCardObj.items.length <= 0)
        {
            let errorData = 'WxMemberCardItemsBusiness->findOwnerMemberByWxData not found wxMemberCard error ' +
                +',wxMemberCardObj :' + JSON.stringify(wxMemberCardObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }

        let wxLoginData = {
            "shopUUID": wxMemberCardObj.items[0].merchantUUID,
            "memberUUID": wxMemcardItemRes.items[0].ownerCardUUID
        };
        let wxLoginRet = await  authWxLoginProxy.execute('member/weixin/memberCard/login',wxLoginData, 'POST');
        console.log('WxMemberCardItemsBusiness->findOwnerMemberByWxData wxLoginRet:' + JSON.stringify(wxLoginRet,null,2));

        return {
            ownerCardUUID:wxMemcardItemRes.items[0].ownerCardUUID,
            ownerCardId:wxMemcardItemRes.items[0].ownerCardId,
            shopUUID: wxMemberCardObj.items[0].merchantUUID,
            token:wxLoginRet.token,
        }
    }


}

let  wxMemberCardItemsBusiness= new WxMemberCardItemsBusiness();
module.exports = wxMemberCardItemsBusiness;
//

/*

wxMemberCardItemsBusiness.activeWxMemberCard({body:{
    code:'182804991184',
    balance:20,
    leftCount:3,
    wxCardId:'pNwkp0eh6KbGp-npax3DXQ5l2Saw',
    openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
    nickname:'lipy',
    mobile:'13410156527',
    name:'李生',
    sex:'男',
    birthday:'1984-10-4',
    password:'111111',
}}).then(data => {
    console.log('activeWxMemberCard data:' + JSON.stringify(data, null, 2));
})
*/

/*wxMemberCardItemsBusiness.decodeCode({body:{encryptCode:'e/ZZn6tnN/pKhmM2f8XOXUEDhBeJdRfzUWMHRG8UvwU='}}).then(data => {
    console.log('decodeCode data:' + JSON.stringify(data, null, 2));
})*/

/*wxMemberCardItemsBusiness.getWxUserInfoByActiveTicket({body:{activate_ticket:'fDZv9eMQAFfrNr3XBoqhb/jyaoEF8uXzzJAcUS5B9uV5SclGx/nPNDM3VULIJk4X1SkGwgyiPFZGE6Q098FyDxCi3ogp+GSrscZBprpYXZc='}}).then(data => {
    console.log('getWxUserInfoByActiveTicket data:' + JSON.stringify(data, null, 2));
})*/

/*wxMemberCardItemsBusiness.getWxUserInfo('oNwkp0e9CLF66b-Xm_ovwIJ63krM').then(data => {
    console.log('getWxUserInfo data:' + JSON.stringify(data, null, 2));
})*/

/*
let templateMsg = {
    openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
    wxMemberShipNo:'881481232433',
    shopName:'温家米粉店',
    consumeAt:'2018-9-9',
    consumeAmount:50,
    balance:2000,
    consumeCount:2,
    leftCount:16,
};
wxMemberCardItemsBusiness.sendConsumeTemplateMsg({body:templateMsg}).then(data => {
    console.log('sendConsumeTemplateMsg data:' + JSON.stringify(data, null, 2));
})
*/

/*
wxMemberCardItemsBusiness.loginWxMiniPrg({body:{wxJSCode:'033hpag10ogeYE16XNc10jjig10hpagL'}}).then(data => {
    console.log('loginWxMiniPrg data:' + JSON.stringify(data, null, 2));
})*/
