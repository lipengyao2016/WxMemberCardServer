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
const wxAccessTokenUtils = require('./WxAccessTokenUtils');
const wxSignUtils = require('../wxUtils/wxSignUtils').wxSignUtils;
const mqBuilder = require('../common/mqBuilder');
const co = require('co');

class WxMemberService
{
    constructor()
    {

    }

    async getWxMemberCardDetailsInfo(cardId,code,merchantUUID)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let getWxCardItemInfoData ={
            "card_id": cardId,
            "code": code,
        };
        let getWxCardItemInfoObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.getMemberDetailsInfoCmd,getWxCardItemInfoData,
            {access_token:accessToken});
        console.log('WxMemberCardBusiness->getWxMemberCardDetailsInfo  success .' );


        let wxUserInfo =  {
            mobile:this.getFieldValue(getWxCardItemInfoObj.user_info.common_field_list,'USER_FORM_INFO_FLAG_MOBILE'),
            name:this.getFieldValue(getWxCardItemInfoObj.user_info.common_field_list,'USER_FORM_INFO_FLAG_NAME'),
            sex:this.getFieldValue(getWxCardItemInfoObj.user_info.common_field_list,'USER_FORM_INFO_FLAG_SEX'),
            birthday:this.getFieldValue(getWxCardItemInfoObj.user_info.common_field_list,'USER_FORM_INFO_FLAG_BIRTHDAY'),
            password:this.getFieldValue(getWxCardItemInfoObj.user_info.custom_field_list,'密码'),
            nickname:getWxCardItemInfoObj.nickname,
        }

        return wxUserInfo;
    }


    getFieldValue(fieldList,fieldName)
    {
        let mobileObj = _.find(fieldList, fieldItem=>_.isEqual(fieldItem.name,fieldName));
        return mobileObj ? mobileObj.value : '';
    }

    async updateMemberCard(data,merchantUUID)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        /*        let updateMemberCardData ={
                    "code": data.wxMemberCardCode,
                    "card_id": data.wxCardId,
                    "background_pic_url": data.wxBackGroudUrl,
                    "record_bonus": ''/!*data.recordBonus*!/,  //"消费20元，获得20积分"
                    "bonus": data.bonus,
                    "add_bonus": data.addBonus,
                 /!*   "balance": 3000,
                    "add_balance": -30,
                    "record_balance": "购买焦糖玛琪朵一杯，扣除金额30元。",*!/
                    "custom_field_value1": `${data.balance}元`,
                    "custom_field_value2": `${data.leftCount}次`,
                    "notify_optional":
                     {
                        "is_notify_bonus": false,
                        // "is_notify_balance": true,
                         "is_notify_custom_field1":!bSubcribed,
                         "is_notify_custom_field2":!bSubcribed,
                    }
                };*/
        let updateMemberObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.updateMemberCardCmd,data,
            {access_token:accessToken});
        console.log('WxMemberCardItemsBusiness->updateMemberCardData  success ' );

        return updateMemberObj;
    }

    async decodeCode(data,merchantUUID)
    {
        let encryptCode = decodeURIComponent(data.encryptCode);
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);

        let decodeRet = await wxRequest.sendRequest(wxConstantConfig.payCmd.decryCodeCmd,
            {encrypt_code:encryptCode}, {access_token:accessToken});
        return decodeRet.code;
    }

    async getWxUserInfoByActiveTicket(content,ctx)
    {
        let data = ctx.method == 'GET' ? content.query : content.body;
        let activate_ticket = decodeURIComponent(data.activate_ticket);
        let accessToken = await  wxAccessTokenUtils.getAccessToken(data.merchantUUID);

        let wxUserInfoRet = await wxRequest.sendRequest(wxConstantConfig.payCmd.getWxUserByActiveTickerCmd,
            {activate_ticket:activate_ticket}, {access_token:accessToken});

        return {
            mobile:this.getFieldValue(wxUserInfoRet.info.common_field_list,'USER_FORM_INFO_FLAG_MOBILE'),
            name:this.getFieldValue(wxUserInfoRet.info.common_field_list,'USER_FORM_INFO_FLAG_NAME'),
            sex:this.getFieldValue(wxUserInfoRet.info.common_field_list,'USER_FORM_INFO_FLAG_SEX'),
            birthday:this.getFieldValue(wxUserInfoRet.info.common_field_list,'USER_FORM_INFO_FLAG_BIRTHDAY'),
            password:this.getFieldValue(wxUserInfoRet.info.custom_field_list,'密码'),
        };
    }



    async activeWxMemberCard(data,merchantUUID)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let wxActiveInfoRet = await wxRequest.sendRequest(wxConstantConfig.payCmd.activeWxMemberCmd,
            data, {access_token:accessToken});
        return wxActiveInfoRet;
    }

}


module.exports = {
    urlRequestMap:[
        {name: 'getWxUserInfoByActiveTicket', method: ['GET','POST'], url:'/api/:version/getWxUserInfoByActiveTicket'}
    ],
    handler:new WxMemberService(),
};

