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
const fs = require('fs');
const rp = require('request-promise');
const wxCrypt = require('../wxUtils/WxCrypt');
const xmlUtils = require('../common/xmlUtils');
const qs = require('querystring');
const ImageUtils = require('../common/ImageUtils');

const WxMsgRecver = require('../wxService/WxMsgRecver');

class WxAuthInfoBusiness extends BaseBusiness
{
    constructor()
    {
         super();
    }

    async getComponetVerifyTicket()
    {
        let ComponentVerifyTicketRedisKey = `ComponentVerifyTicket_${config.wxThridPlatformInfo.appId}` ;
        let ComponentVerifyTicket = await redis.get(ComponentVerifyTicketRedisKey);

        if(!_.isEmpty(ComponentVerifyTicket))
        {
            console.log('WxAuthInfoBusiness->getComponetVerifyTicket from cache ComponentVerifyTicket:' + ComponentVerifyTicket);
            return ComponentVerifyTicket;
        }
        else
        {
            return null;
        }
    }

    async getComponentAccessToken()
    {
        let componentAccessTokenRedisKey = `ComponentAccessToken_${config.wxThridPlatformInfo.appId}` ;
        let componentAccessTokenData = await redis.get(componentAccessTokenRedisKey);

        if(!_.isEmpty(componentAccessTokenData))
        {
            console.log('WxAuthInfoBusiness->getComponentAccessToken from cache componentAccessTokenData:' + componentAccessTokenData);
            return componentAccessTokenData;
        }

        let component_verify_ticket = await this.getComponetVerifyTicket();

        let reqParams = {
            "component_appid":config.wxThridPlatformInfo.appId ,
            "component_appsecret": config.wxThridPlatformInfo.appSecret,
            "component_verify_ticket": component_verify_ticket,
        };

        let componentAccessTokenObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.queryComponetAccessTokenCmd,reqParams,{},'POST');
        componentAccessTokenData = componentAccessTokenObj.component_access_token;
        let tokenExpiredIn = componentAccessTokenObj.expires_in;

        console.log('WxAuthInfoBusiness->getComponentAccessToken ok componentAccessTokenData:' + componentAccessTokenData +
            ',tokenExpiredIn:' + tokenExpiredIn);

        await redis.setex(componentAccessTokenRedisKey,tokenExpiredIn/2,componentAccessTokenData);

        return componentAccessTokenData;
    }


    async getPreAuthCode()
    {
        let componentAccessToken = await this.getComponentAccessToken();
        let reqParams = {
            "component_appid":config.wxThridPlatformInfo.appId ,
        };
        let preAuthCodeObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.createPreAuthCodeCmd,reqParams,{component_access_token:componentAccessToken},'POST');
        console.log('WxAuthInfoBusiness->getPreAuthCode ok preAuthCodeObj:' /*+ JSON.stringify(preAuthCodeObj)*/);
        return preAuthCodeObj.pre_auth_code;
    }

    async getWxAuthUrl(content,ctx)
    {
        let data = content.query;
        let merchantUUID = data.merchantUUID;
        let redirectUrl = config.wxThridPlatformInfo.authRedirectUrl;
        redirectUrl += `?merchantUUID=${merchantUUID}`;
        let preAuthCode = await this.getPreAuthCode();
        let authUrl = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage';
        let authParams = {
            auth_type:3,
            component_appid:config.wxThridPlatformInfo.appId,
            pre_auth_code:preAuthCode,
            redirect_uri:redirectUrl,
        };

        return {authUrl:`${authUrl}?${qs.stringify(authParams)}`};
    }

    async saveAuthInfo(wxAuthInfo)
    {
        let wxAuthObjs = await this.model.listAll({merchantUUID:wxAuthInfo.merchantUUID,authAppId:wxAuthInfo.authAppId});
        let wxAuthInfoRes;
        if(wxAuthObjs.items.length > 0)
        {
            wxAuthInfo.uuid = wxAuthObjs.items[0].uuid;
            wxAuthInfo.modifiedAt = utils.getTimeStr(new Date(),true);
            wxAuthInfoRes = await this.update(wxAuthInfo);
            console.log('saveAuthInfo->wxAuthInfo has exist,update data ,wxAuthInfoRes:' + JSON.stringify(wxAuthInfoRes,null,2));
        }
        else
        {
            wxAuthInfo = parse(this.resourceConfig,'WxAuthInfo',wxAuthInfo);
            wxAuthInfoRes = await this.create(wxAuthInfo);
            console.log('saveAuthInfo->wxAuthInfo not exist,create data ,wxAuthInfoRes:' + JSON.stringify(wxAuthInfoRes,null,2));
        }
        return wxAuthInfoRes;
    }

    async onAuthRet(content,ctx)
    {
        let data = content.query;
        console.log('onAuthRet->get ,query:' + JSON.stringify(content.query));
        let authInfo = await this.queryAuthInfoByAuthCode(data.auth_code);
        let authDetailInfo = await this.queryAuthDetailInfo(authInfo.authorization_info.authorizer_appid);

        let fileServerURL = URIParser.baseResourcesURI('FileServer','fileUpload');
        let qrCodeUploadObj = await ImageUtils.uploadNetworkImage(fileServerURL,authDetailInfo.authorizer_info.qrcode_url,config.tmpFilePath,
            {uploadType: "mobile"}) ;
        let wxAuthInfo = {
            merchantUUID:data.merchantUUID,
            authAppId:authInfo.authorization_info.authorizer_appid,
            authRefreshToken:authInfo.authorization_info.authorizer_refresh_token,
            //funcInfo:authInfo.authorization_info.func_info,
            serviceType:_.has(authDetailInfo,'authorizer_info.MiniProgramInfo') ? 1 : 0,
            nickName: authDetailInfo.authorizer_info.nick_name,
            headImgUrl:authDetailInfo.authorizer_info.head_img,
            verifyType:authDetailInfo.authorizer_info.verify_type_info.id,
            originId:authDetailInfo.authorizer_info.user_name,
            principalName:authDetailInfo.authorizer_info.principal_name,
            //businessInfo:authDetailInfo.authorizer_info.business_info,
            qrcodeUrl:qrCodeUploadObj.retUrl,
        };

        let wxAuthInfoObj = await this.saveAuthInfo(wxAuthInfo);
        console.log('onAuthRet->save auth info to db ok... wxAuthInfoObj:' + JSON.stringify(wxAuthInfoObj,null,2));

        let authorizerAccessTokenRedisKey = `authorizer_access_token_${authInfo.authorization_info.authorizer_appid}` ;
        await redis.setex(authorizerAccessTokenRedisKey,authInfo.authorization_info.expires_in/2,authInfo.authorization_info.authorizer_access_token);

        let wxAuthInfoRedisKey = `wxAuthInfo_${data.merchantUUID}_${wxAuthInfo.serviceType}`;
        await redis.delete(wxAuthInfoRedisKey);


        let authSucedEventData = {
            body:{
                Event:wxConstantConfig.wxEvent.authSucedEvent,
                merchantUUID:data.merchantUUID,
                appId:authInfo.authorization_info.authorizer_appid,
                serviceType:wxAuthInfo.serviceType,
            },
            query:{
            }
        };
        await WxMsgRecver.wxMemberCardMQ.sendMsg(authSucedEventData/*,'30000'*/);

        return {ret:'success'};
    }

    async queryAuthInfoByAuthCode(authCode)
    {
        let componentAccessToken = await this.getComponentAccessToken();
        let reqParams = {
            "component_appid":config.wxThridPlatformInfo.appId ,
            "authorization_code": authCode,
        };
        let authInfoObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.queryAuthInfoByAuthCodeCmd,reqParams,{component_access_token:componentAccessToken},'POST');
        console.log('WxAuthInfoBusiness->queryAuthInfoByAuthCode ok authInfoObj:' /*+ JSON.stringify(authInfoObj,null,2)*/);
        return authInfoObj;
    }


    async queryAuthDetailInfo(authorizerAppid)
    {
        let componentAccessToken = await this.getComponentAccessToken();
        let reqParams = {
            "component_appid":config.wxThridPlatformInfo.appId,
            "authorizer_appid": authorizerAppid
        };
        let authDetailInfoObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.queryAuthDetailInfoCmd,reqParams,{component_access_token:componentAccessToken},'POST');
        console.log('WxAuthInfoBusiness->queryAuthDetailInfo ok authDetailInfoObj:' /*+ JSON.stringify(authDetailInfoObj,null,2)*/);
        return authDetailInfoObj;
    }



    async getAuthAccessToken(merchantUUID,isMiniPrg = false)
    {
        let serviceType = isMiniPrg?1:0;
        let wxAuthInfoRedisKey = `wxAuthInfo_${merchantUUID}_${serviceType}`;
        let wxAuthInfo ;
        let wxRedisAuthData = await redis.get(wxAuthInfoRedisKey);
        if(_.isEmpty(wxRedisAuthData))
        {
            wxAuthInfo = await this.model.listAll({merchantUUID:merchantUUID,serviceType:serviceType});
            if(wxAuthInfo.items.length <= 0)
            {
                let errorData = (`WxAuthInfoBusiness->getAuthAccessToken not found authInfo by merchantUUID:${merchantUUID},isMiniPrg:${isMiniPrg}`);
                console.error(errorData);
                throw  new Error(errorData);
            }
            await redis.setex(wxAuthInfoRedisKey,3600*12,JSON.stringify(wxAuthInfo));
            console.log('WxAuthInfoBusiness->getAuthAccessToken get wxAuthInfo from db wxAuthInfo:' + JSON.stringify(wxAuthInfo,null,2));
        }
        else
        {
            wxAuthInfo = JSON.parse(wxRedisAuthData);
            console.log('WxAuthInfoBusiness->getAuthAccessToken get wxAuthInfo from redis wxAuthInfo:' + JSON.stringify(wxAuthInfo,null,2));
        }



        let authorizerAccessTokenRedisKey = `authorizer_access_token_${wxAuthInfo.items[0].authAppId}` ;
        let authorizerAccessTokenData = await redis.get(authorizerAccessTokenRedisKey);

        if(!_.isEmpty(authorizerAccessTokenData))
        {
            console.log('WxAuthInfoBusiness->getAuthAccessToken from cache authorizerAccessTokenData:' + authorizerAccessTokenData);
            return authorizerAccessTokenData;
        }

        let reqParams = {
            "component_appid":config.wxThridPlatformInfo.appId,
            "authorizer_appid":wxAuthInfo.items[0].authAppId,
            "authorizer_refresh_token":wxAuthInfo.items[0].authRefreshToken,
        };

        let componentAccessToken = await this.getComponentAccessToken();
        let authAccessTokenObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.refreshAuthAccessTokenCmd,reqParams,{component_access_token:componentAccessToken},'POST');
        authorizerAccessTokenData = authAccessTokenObj.authorizer_access_token;
        let tokenExpiredIn = authAccessTokenObj.expires_in;

        console.log('WxAuthInfoBusiness->getAuthAccessToken ok authorizerAccessTokenData:' + authorizerAccessTokenData +
            ',tokenExpiredIn:' + tokenExpiredIn);

        await redis.setex(authorizerAccessTokenRedisKey,tokenExpiredIn/2,authorizerAccessTokenData);

        return authorizerAccessTokenData;
    }



    async onRecvAuthEvent(content,ctx)
    {
        let data;
        if(ctx.method == 'GET')
        {
            console.log('onRecvAuthEvent->get ,query:' + JSON.stringify(content.query,null,2));
        }
        else if(ctx.method == 'POST')
        {
            console.log('onRecvAuthEvent->post ,body:' + JSON.stringify(content.body,null,2));
            data = content.body;
            if(!_.isEmpty(data.Encrypt))
            {
                 let encryptXmlData = wxCrypt.decrypt(data.Encrypt);
                 let encryptData = await  xmlUtils.xmlToObj(encryptXmlData);
                console.log('onRecvAuthEvent->post ,decrypt encryptData:' + JSON.stringify(encryptData,null,2));
                 if(!_.isEmpty(encryptData.InfoType))
                 {
                     if(encryptData.InfoType.indexOf('component_verify_ticket') >= 0)
                     {
                         let ComponentVerifyTicket = encryptData.ComponentVerifyTicket;
                         let ComponentVerifyTicketRedisKey = `ComponentVerifyTicket_${encryptData.AppId}` ;
                        // await redis.set(ComponentVerifyTicketRedisKey,ComponentVerifyTicket);
                         await redis.setex(ComponentVerifyTicketRedisKey,3600 * 6,ComponentVerifyTicket);
                         console.log(`onRecvAuthEvent->post , save ComponentVerifyTicket:${ComponentVerifyTicket} to redis`);
                     }
                 }
            }
        }
        return "success";
    }


    async onRecvMsgEvent(content,ctx)
    {
        console.log('onRecvMsgEvent->get ,params:' + JSON.stringify(ctx.params));
        if(ctx.method == 'GET')
        {
            console.log('onRecvMsgEvent->get ,query:' + JSON.stringify(content.query));
        }
        else if(ctx.method == 'POST')
        {
            console.log('onRecvMsgEvent->post ,body:' + JSON.stringify(content.body));
            let data = content.body;
            if(!_.isEmpty(data.Encrypt))
            {
                let encryptXmlData = wxCrypt.decrypt(data.Encrypt);
                let encryptData = await  xmlUtils.xmlToObj(encryptXmlData);
                console.log('onRecvMsgEvent->post ,decrypt encryptData:' + JSON.stringify(encryptData,null,2));
                await  WxMsgRecver.getMsgMQ().sendMsg({body:encryptData,query:content.query});
            }
        }
        return "success";
    }

}


let wxAuthInfoBusiness = new WxAuthInfoBusiness();
module.exports = wxAuthInfoBusiness;

