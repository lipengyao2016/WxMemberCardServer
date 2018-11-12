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
const wxRequest = require('../wxUtils/wxRequest').wxRequest;
const wxConstantConfig = require('../wxUtils/wxConstantConfig');
const wxAccessTokenUtils = require('../wxService/WxAccessTokenUtils');
const wxSignUtils = require('../wxUtils/wxSignUtils').wxSignUtils;
const mqBuilder = require('../common/mqBuilder');

const ResourceNameType = require('../proxy/baseProxyFactory').ResourceNameType;
const gradeRuleProxy = require('../proxy/baseProxyFactory').getResourceProxy(ResourceNameType.Resource_GradeRules);
const memberGradeProxy = require('../proxy/baseProxyFactory').getResourceProxy(ResourceNameType.Resource_MemberGrades);
const wxMsgRecver = require('../wxService/WxMsgRecver');

class WxMemberCardBusiness extends BaseBusiness
{
    constructor()
    {
        super();
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.cardPassEvent,this.handleCheckMemberCardEvent,this);
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.cardRejectEvent,this.handleCheckMemberCardEvent,this);
    }


    async handleCheckMemberCardEvent(data,query)
    {
        //return true;

        let CardId = data.CardId;
        let status = (data.Event == 'card_pass_check') ? 'audited' : 'rejected';
        let refuseReason = data.RefuseReason;
        let wxMemberCardRes = await this.model.listAll({wxCardId:CardId});
        console.log('WxMemberCardBusiness->handleCheckMemberCardEvent wxMemberCardRes:' + JSON.stringify(wxMemberCardRes,null,2));
        if(wxMemberCardRes.items.length > 0)
        {
            let updateMerchantCardData = {
                uuid : wxMemberCardRes.items[0].uuid,
                status:status,
                refuseReason:refuseReason,
                modifiedAt:utils.getTimeStr(new Date(),true),
            };
            await this.update(updateMerchantCardData);
            return true;
        }
        else
        {
            let errorData = 'WxMemberCardBusiness->handleCheckMemberCardEvent not find wxMemberCard, by CardId, '  + CardId;
            console.error(errorData);
            throw new Error(errorData);
        }
    }

    async setWxActiveUserForm(wxCardId,merchantUUID)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let activeUserForm ={
            "card_id": wxCardId,
            "service_statement": {
                "name": "会员守则",
                "url": "https://www.qq.com"
            },
           /* "bind_old_card": {
                "name": "老会员绑定",
                "url": "https://www.sina.com"
            },*/
            "required_form": {
                "can_modify": false,
                "common_field_id_list": ["USER_FORM_INFO_FLAG_MOBILE",
                    "USER_FORM_INFO_FLAG_NAME"]
            },
            "optional_form": {
                "can_modify": false,
                "common_field_id_list": ["USER_FORM_INFO_FLAG_LOCATION",
                    "USER_FORM_INFO_FLAG_BIRTHDAY",
                    "USER_FORM_INFO_FLAG_SEX",
                ],
               /* "custom_field_list": [
                    "密码"
                ]*/

            }
        };
        let setActiveCardFormObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.setActiveCardFormCmd,activeUserForm,
            {access_token:accessToken});
        console.log('WxMemberCardBusiness->setWxActiveUserForm  success card_id:' +wxCardId);

        return setActiveCardFormObj;
    }

    async create(data,ctx)
    {
        let merchantRes = await request.get(data.merchantHref);
        if(merchantRes.statusCode != 200)
        {
            let errorData = 'WxMemberCardBusiness->create get merchant info failed, by merchantHref, '  + data.merchantHref
            + ',body:' + JSON.stringify(merchantRes.body);
            console.error(errorData);
            throw new Error(errorData);
        }

        let merchantUUID = devUtils.getLastResourceUUIDInURL(data.merchantHref);
        let wxMemberQS = {merchantUUID:data.merchantUUID};
        let curAppId = config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId : config.wxPublicNoInfo.normal.appId;
        wxMemberQS['wxAppId'] = curAppId;

        let wxMemberCardObj = await this.model.listAll(wxMemberQS);
        if(wxMemberCardObj.items.length > 0)
        {
            let errorData = 'WxMemberCardBusiness->create wxUtils Membercard has exist' +
                ', merchantUUID:' + data.merchantUUID + ',wxMemberCardObj:' + JSON.stringify(wxMemberCardObj);
            console.error(errorData);
            throw new Error(errorData);
        }



        //let gradeRuleObj = await gradeRuleProxy.execute('getGradeRule',{shopUUID:merchantUUID});
        let defMemberGradeObj = await memberGradeProxy.listAll({shopUUID:merchantUUID,isDefault:1});
        data.logoUrl = data.logoUrl ? data.logoUrl : merchantRes.body.icon;



        let wxLogoUrl = await this.businesses['wxImage'].uploadImage(data.logoUrl,merchantUUID);

        data.backgroudUrl = data.backgroudUrl ? data.backgroudUrl : defMemberGradeObj.items[0].backgroundPictureURL;
        let wxBackGroudUrl = await this.businesses['wxImage'].uploadImage(data.backgroudUrl,merchantUUID);

        data.title = data.title ? data.title :  defMemberGradeObj.items[0].name;
        data.brandName = data.brandName ? data.brandName :  merchantRes.body.name;

        if(data.text_image_list && data.text_image_list.length > 0)
        {
            for(let i = 0 ;i < data.text_image_list.length;i++)
            {
                data.text_image_list[i].image_url = await this.businesses['wxImage'].uploadImage(data.text_image_list[i].image_url
                    ,merchantUUID);
            }
        }


        let cardData = {
            "card": {
                "card_type": "MEMBER_CARD",
                "member_card": {
                    "background_pic_url": wxBackGroudUrl,
                    "base_info": {
                        "logo_url": wxLogoUrl,
                        "brand_name":  data.brandName,
                        "code_type": "CODE_TYPE_QRCODE",
                        "title": data.title,
                        "color": "Color010",
                        "notice": data.notice,
                        "service_phone": data.servicePhone,
                        "description": data.description,
                        "date_info": data.date_info,
                        "sku": {
                            "quantity": data.quatity
                        },
                        "get_limit": 1,
                        "use_custom_code": false,
                        "can_give_friend": false,
                        "custom_url_name": "储值记录" ,
                        "custom_url": config.wxPublicNoInfo.memberCard.rechargeCard_url,
                        "custom_url_sub_title": "查看储值记录" ,
                        "promotion_url_name":"体验册" ,
                        "promotion_url": config.wxPublicNoInfo.memberCard.cardBalance_url,
                        "promotion_url_sub_title":"查看卡内余额",
                        "need_push_on_view": false
                    },

                    /** 2018/8/31  屏蔽显示高级配置信息。
                     lpy-modifyed  */
                      "advanced_info": {
                          "time_limit": data.time_limit,
                           business_service:data.business_service,
                           text_image_list:data.text_image_list,
                      },

                    "supply_bonus": false,    //不支持积分
                    "supply_balance": false,  //不支付余额。
                    "prerogative": data.prerogative,
                    //"auto_activate": true,
                    "wx_activate":true,

                    /** 2018/9/27  是否开启跳转型一键激活。
                     lpy-modifyed  */
                     "wx_activate_after_submit" : true,
                     "wx_activate_after_submit_url" : config.wxPublicNoInfo.memberCard.wx_activate_after_submit_url,

                    "custom_field1": {
                        "name_type": "FIELD_NAME_TYPE_LEVEL",
                        "name":"余额",
                        "url": config.wxPublicNoInfo.memberCard.balance_url,
                    },
                    "custom_field2": {
                        "name_type": "FIELD_NAME_TYPE_TIMS",
                        "name":"次数",
                        "url": config.wxPublicNoInfo.memberCard.leftCnt_url,
                    },
                    /* "custom_field3": {
                         "name_type": "FIELD_NAME_TYPE_LEVEL",
                         "name":"积分",
                         "url": "http://www.qq.com"
                     },*/
                    "custom_cell1": {
                        "name":  "划卡记录",
                        "tips": "查看划卡记录",
                        "url": config.wxPublicNoInfo.memberCard.payCard_url,
                    },

                    /** 2018/8/31  屏蔽显示积分规则和折扣比例。
                     lpy-modifyed  */
                  /*   "bonus_rule": {
                         "cost_money_unit": 100,
                         "increase_bonus": 1,
                         "max_increase_bonus": 200,
                         "init_increase_bonus": 10,
                         "cost_bonus_unit": 5,
                         "reduce_money": 100,
                         "least_money_to_use_bonus": 1000,
                         "max_reduce_bonus": 50
                     },
                    "discount": 5*/
                }
            }
        };

        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);


        let createMemberCardObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.memberCardCreateCmd,cardData,
            {access_token:accessToken});
        console.log('WxMemberCardBusiness->create membercard success card_id:' + createMemberCardObj.card_id);

        await this.setWxActiveUserForm(createMemberCardObj.card_id,merchantUUID);
        console.log('WxMemberCardBusiness->create set active card form success, card_id:' + createMemberCardObj.card_id);


        let wxMemberCardData = utils.copyObjSaveSomeAttrs(data,['merchantHref','title','brandName','servicePhone','logoUrl',
        'notice','description','backgroudUrl','quatity']);

        wxMemberCardData['wxCardId'] = createMemberCardObj.card_id;
        wxMemberCardData['status'] = 'created';
        wxMemberCardData['wxAppId'] = curAppId;

        wxMemberCardData = parse(this.resourceConfig,'wxMemberCard',wxMemberCardData);

        return await super.create(wxMemberCardData,ctx);
    }


    async createWxMemberCardQRCode(content,ctx)
    {
        let data = content.body;
        if(data.merchantHref)
        {
            data.merchantUUID = devUtils.getLastResourceUUIDInURL(data.merchantHref);
        }

        let wxMemberQS = {merchantUUID:data.merchantUUID};
/*        if(!_.isEmpty(data.wxCardId))
        {
            wxMemberQS.wxCardId = data.wxCardId;
        }*/
/*        let curAppId = config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId : config.wxPublicNoInfo.normal.appId;
        wxMemberQS['wxAppId'] = curAppId;*/
        let wxMemberCardObj = await this.model.listAll(wxMemberQS);
        if(wxMemberCardObj.items.length <= 0 || _.isEmpty(wxMemberCardObj.items[0].wxCardId))
        {
            let errorData = 'WxMemberCardBusiness->createWxMemberCardQRCode not found wxMembercard by merchantUUID, ' +
                ' or wxCardId is empty!!! error ' +
                ', merchantUUID:' + data.merchantUUID + ',wxMemberCardObj:' + JSON.stringify(wxMemberCardObj);
            console.error(errorData);
            throw new Error(errorData);
        }

        let curMemberCardObj = wxMemberCardObj.items[0];
        let wxCardId = curMemberCardObj.wxCardId;
        if(!_.isEmpty(curMemberCardObj.wxQRCodeUrl))
        {
            return {wxCardId:wxCardId,wxQRCodeUrl:curMemberCardObj.wxQRCodeUrl};
        }

        let accessToken = await  wxAccessTokenUtils.getAccessToken(data.merchantUUID);
        let wxCardQRCodeData ={
            "action_name": "QR_CARD",
            "action_info": {
                "card": {
                    "card_id": wxCardId,
                    "is_unique_code": false,
                    "outer_str": "12b"
                }
            }
        };
        let memberCardQRCodeObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.createMemCardQRCodeCmd,wxCardQRCodeData,
            {access_token:accessToken});
        console.log('WxMemberCardBusiness->createWxMemberCardQRCode  success ' +
            'card_id:' +wxCardId+',show_qrcode_url:' + memberCardQRCodeObj.show_qrcode_url);

        let updateMemberCardData = {
            uuid:wxMemberCardObj.items[0].uuid,
            wxQRCodeUrl:memberCardQRCodeObj.show_qrcode_url,
            modifiedAt:utils.getTimeStr(new Date(),true),
        };

        await super.update(updateMemberCardData);
        return {wxCardId:wxCardId,wxQRCodeUrl:updateMemberCardData.wxQRCodeUrl};
    }


    async setWxMemberCardTestWhiteList(content,ctx)
    {
        let data = content.body;
        let accessToken = await  wxAccessTokenUtils.getAccessToken(data.merchantUUID);
        let setWxWhiteListData ={
            //"openid": ["o1Pj9jmZvwSyyyyyyBa4aULW2mA","o1Pj9jmZvxxxxxxxxxULW2mA"],
            "username": data.userName,
        };
        let setWhiteListObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.setTestWhiteListCmd,setWxWhiteListData,
            {access_token:accessToken});
        console.log('WxMemberCardBusiness->setWxWhiteListData  success ' );

        return {ret:true,"username": data.userName};
    }

    async onRecvWxMsg(content,ctx)
    {
        if(ctx.method == 'GET')
        {
            console.log('onRecvWxMsg->get ,query:' + JSON.stringify(content.query));

            let signature = content.query.signature;
            let timestamp = content.query.timestamp;
            let nonce = content.query.nonce;
            let echostr = content.query.echostr;
            if(wxSignUtils.verify(timestamp,nonce,signature,config.wxPublicNoInfo.wxToken))
            {
                console.log('WxMemberCardBusiness->onRecvWxMsg verify   success...');
                return echostr;
            }
            else
            {
                console.error('WxMemberCardBusiness->onRecvWxMsg verify   error!!!');
                return "It is not from weixin";
            }
        }
        else if(ctx.method == 'POST')
        {
            console.log('onRecvWxMsg->post ,body:' + JSON.stringify(content.body));
            let data = content.body;

            if(data.MsgType == 'event')
            {
                await wxMsgRecver.wxMemberCardMQ.sendMsg(content/*,'30000'*/);
            }

        }
        return 'success';
    }


    async countWxMemberGetCardsCnt(content,ctx)
    {
        let data = content.query;
        if(data.merchantHref)
        {
            data.merchantUUID = devUtils.getLastResourceUUIDInURL(data.merchantHref);
        }

        let wxMemberQS = {merchantUUID:data.merchantUUID};
        let wxMemberCardObj = await this.model.listAll(wxMemberQS);
        if(wxMemberCardObj.items.length <= 0 || _.isEmpty(wxMemberCardObj.items[0].wxCardId))
        {
            let errorData = 'WxMemberCardBusiness->countWxMemberGetCardsCnt not found wxMembercard by merchantUUID, ' +
                ' or wxCardId is empty!!! error ' +
                ', merchantUUID:' + data.merchantUUID + ',wxMemberCardObj:' + JSON.stringify(wxMemberCardObj);
            console.error(errorData);
            throw new Error(errorData);
        }

        let curMemberCardObj = wxMemberCardObj.items[0];
        let wxCardId = curMemberCardObj.wxCardId;
        let knex = this.dbOperater;
        //let wxMemberCardItemName = this.models['wxMemberCardItem'].prototype.tableName;
        let countSql = `SELECT COUNT(*) AS countItems,wxCardId from WxMemberCardItems where wxCardId = '${wxCardId}' and status = 'normal'`;
        let countRet = await  knex.raw(countSql);
        let i = 1;
        let countData = countRet[0];
        console.log('WxMemberCardBusiness->countWxMemberGetCardsCnt countData:' + JSON.stringify(countData,null,2));
        return {
            merchantUUID:data.merchantUUID,
            wxCardId:wxCardId,
            countItems:countData[0].countItems,
        };

    }


}

let wxMemberCardBusiness = new WxMemberCardBusiness();
module.exports = wxMemberCardBusiness;

/*
wxMemberCardBusiness.getWxMemberCardDetailsInfo('pNwkp0eh6KbGp-npax3DXQ5l2Saw','182804991184').then(data=>{
   console.log('getWxMemberCardDetailsInfo data:' + JSON.stringify(data,null,2));
});
*/
