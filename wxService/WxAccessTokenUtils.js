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
const wxAuthInfoBusiness = require('../business/WxAuthInfoBusiness');

class WxAccessTokenUtils
{
    constructor()
    {

    }

    async getAccessToken(merchantUUID,isMiniPrg = false)
    {
        if(config.wxThridPlatformInfo.userThirdPlatform)
        {
             let authAccessToken = await wxAuthInfoBusiness.getAuthAccessToken(merchantUUID,isMiniPrg);
            console.log('WxAccessTokenUtils->getAccessToken from thirdPlatform info authAccessToken:' + authAccessToken);
            return authAccessToken;
        }
        else
        {
            let reqParams = {
                grant_type:'client_credential',
                appid:config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId :
                    config.wxPublicNoInfo.normal.appId,
                secret:config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appSecret :
                    config.wxPublicNoInfo.normal.appSecret,
            };

            let accessTokenRedisKey = `wxAccessToken_${reqParams.appid}` ;
            let accessTokenData = await redis.get(accessTokenRedisKey);

            if(!_.isEmpty(accessTokenData))
            {
                console.log('WxAccessTokenUtils->getAccessToken from cache accessTokenData:' + accessTokenData);
                return accessTokenData;
            }

            let accessTokenObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.getAccessTokenCmd,reqParams,{},'GET');
            accessTokenData = accessTokenObj.access_token;
            let tokenExpiredIn = accessTokenObj.expires_in;

            console.log('WxAccessTokenUtils->getAccessToken ok accessTokenData:' + accessTokenData +
                ',tokenExpiredIn:' + tokenExpiredIn);

            await redis.setex(accessTokenRedisKey,tokenExpiredIn/2,accessTokenData);
            return accessTokenData;
        }
    }


    async getWxMiniPrgSession(wxMiniPrgCode)
    {
        let reqParams = {
            appid:config.wxMiniPrgInfo.appId,
            secret:config.wxMiniPrgInfo.appSecret,
            js_code:wxMiniPrgCode,
            grant_type:'authorization_code',

        };
        let wxPrgJsSessionObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.getWxPrgJsSessionCmd,reqParams,{},'GET');
        return wxPrgJsSessionObj;
    }


}


let wxAccessTokenUtils = new WxAccessTokenUtils();
module.exports = wxAccessTokenUtils;

/*
wxAccessTokenUtils.getAccessToken().then(data=>{
   console.log(' getAccessToken data: ' + data);
});
*/

/*
wxAccessTokenUtils.getWxMiniPrgSession('02318TX80GvIMG1OkPY80MaDX8018TXZ').then(data=>{
    console.log(' getWxMiniPrgSession data: ' + JSON.stringify(data,null,2));
});
*/

