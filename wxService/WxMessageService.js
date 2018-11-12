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

class WxMessageService
{
    constructor()
    {

    }

    async sendConsumeTemplateMsg(data,merchantUUID)
    {
        let {openId,title,consumeAt,consumeType,consumeAmount,leftAmount,consumeRemark,remark,clickUrl} = data;
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);

        let sendTemplateData ={
            "touser":openId,
            "template_id":config.wxPublicNoInfo.normal.consumeTemplateId,
            "url":clickUrl,
            /*  "miniprogram":{
                  "appid":"xiaochengxuappid12345",
                  "pagepath":"index?foo=bar"
              },*/
            "data":{
                "first": {
                    "value":title,
                    "color":"#173177"
                },
                "keyword1":{
                    "value":consumeAt,
                    "color":"#173177"
                },
                "keyword2": {
                    "value":consumeType,
                    "color":"#173177"
                },
                "keyword3": {
                    "value":consumeAmount,
                    "color":"#173177"
                },
                "keyword4": {
                    "value":leftAmount,
                    "color":"#173177"
                },
                "keyword5": {
                    "value":consumeRemark,
                    "color":"#173177"
                },
                "remark":{
                    "value":remark,
                    "color":"#173177"
                }
            }
        };

        let templateMsgRet = await wxRequest.sendRequest(wxConstantConfig.payCmd.sendTemplateMsgCmd,
            sendTemplateData, {access_token:accessToken});
        return templateMsgRet;
    }
}

let wxMessageService = new WxMessageService();
module.exports = wxMessageService;

