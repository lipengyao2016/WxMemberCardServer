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
const wxMsgRecver = require('../wxService/WxMsgRecver');

class WxOpenAccountBindBusiness extends BaseBusiness
{
    constructor()
    {
         super();
         wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.authSucedEvent,this.handleAuthSucedEvent,this);
    }

    async createOpenAccount(merchantUUID,appId,isMiniPrg)
    {
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,isMiniPrg);
        let reqParams = {
            "appid": appId,
        };
        let openAccountInfoObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.createOpenAccountCmd,reqParams,
            {access_token:accessToken},'POST');
        console.log('WxOpenAccountBindBusiness->createOpenAccount ok ' );
        return openAccountInfoObj;
    }

    async bindOpenAccount(merchantUUID,appId,openAppId,isMiniPrg)
    {
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,isMiniPrg);
        let reqParams = {
            "appid": appId,
            "open_appid": openAppId,
        };
        let bindOpenAccountInfoObj = await wxRequest.sendRequest(wxConstantConfig.thirdPlatformCmd.bindOpenAccountCmd,reqParams,
            {access_token:accessToken},'POST');
        console.log('WxOpenAccountBindBusiness->bindOpenAccount ok ' );
        return bindOpenAccountInfoObj;
    }

    async handleAuthSucedEvent(data,query)
    {
        let {merchantUUID,appId,serviceType} = data;
        let isMiniPrg = (serviceType == 1);
        let wxAuthInfoObjs = await this.models['WxAuthInfo'].listAll({merchantUUID:merchantUUID});
        if(wxAuthInfoObjs.items.length <= 0 )
        {
            let errorData = 'WxOpenAccountBindBusiness->handleAuthSucedEvent not found wxAuthInfo by merchantUUID error ' +
                ',wxAuthInfoObjs :' + JSON.stringify(wxAuthInfoObjs,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }
        let authAppIds = wxAuthInfoObjs.items.map(wxAuthInfoItem=>wxAuthInfoItem.authAppId);
        let wxOpenAccountBindObjs = await this.model.listAll({authAppId:authAppIds});
        let openAppId;

        let curAppBindObjs = _.find(wxOpenAccountBindObjs.items,wxOpenBindItem=>_.isEqual(wxOpenBindItem.authAppId,appId));
        if(curAppBindObjs)
        {
            console.log('WxOpenAccountBindBusiness->handleAuthSucedEvent has bind openAccount curAppBindObjs:'
                + JSON.stringify(curAppBindObjs,null,2));
        }
        else
        {
            if(wxOpenAccountBindObjs.items.length <= 0 )
            {
                let wxOpenAccountObjs = await this.createOpenAccount(merchantUUID,appId,isMiniPrg);
                openAppId = wxOpenAccountObjs.open_appid;
                console.log('WxOpenAccountBindBusiness->handleAuthSucedEvent not found openAccount ,will first create!! wxOpenAccountObjs:'
                    + JSON.stringify(wxOpenAccountObjs,null,2));
            }
            else
            {
                openAppId = wxOpenAccountBindObjs.items[0].openAppId;
                let wxBindOpenAccountObjs = await this.bindOpenAccount(merchantUUID,appId,openAppId,isMiniPrg);
                console.log('WxOpenAccountBindBusiness->handleAuthSucedEvent  openAccount has exist ,will bind app!! ' +
                    'wxBindOpenAccountObjs:' + JSON.stringify(wxBindOpenAccountObjs,null,2));
            }

            let wxOpenAccountBindData = {
                openAppId:openAppId,
                authAppId:appId,
            };
            wxOpenAccountBindData = parse(this.resourceConfig,'WxOpenAccountBind',wxOpenAccountBindData);
            let wxOpenBindRes = await this.create(wxOpenAccountBindData);
            console.log('WxOpenAccountBindBusiness->handleAuthSucedEvent save bind memberShips ' +
                'wxOpenBindRes:' + JSON.stringify(wxOpenBindRes,null,2));
        }

        return true;
    }



}


let wxOpenAccountBindBusiness = new WxOpenAccountBindBusiness();
module.exports = wxOpenAccountBindBusiness;


let authSucedEventData = {
    body:{
        Event:wxConstantConfig.wxEvent.authSucedEvent,
        merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
        appId:'wxbc4ee34494150e2e',
        serviceType:1,
    },
    query:{
    }
};

/*
setTimeout(function () {
    wxMsgRecver.wxMemberCardMQ.sendMsg(authSucedEventData).then(data=>{
        console.log('send auth suced msg ok!!!!');
    });
},6000);
*/

