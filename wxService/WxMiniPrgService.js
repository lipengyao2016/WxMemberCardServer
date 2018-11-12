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
const wxMemberCardItemsBusiness = require('../business/WxMemberCardItemsBusiness');

class WxMiniPrgService
{
    constructor()
    {

    }

    async queryWxPrgCardInfo(content,ctx)
    {
        let data = content.query;

        let wxPrgJsSessionObj = await wxAccessTokenUtils.getWxMiniPrgSession(data.wxJSCode);
        if(_.isEmpty(wxPrgJsSessionObj.unionid))
        {
            let errorData = 'WxMiniPrgService->loginWxMiniPrg not found unionid error ' ;
            console.error(errorData);
            throw new Error(errorData);
        }
        let wxMemberCardItemObj = await wxMemberCardItemsBusiness.model.listAll({unionId:wxPrgJsSessionObj.unionid,isActived:1});
        if(wxMemberCardItemObj.items.length <= 0 )
        {
            let errorData = 'WxMiniPrgService->loginWxMiniPrg not found wxMemberCardItem by unionId error ' +
                ',wxMemberCardItemObj :' + JSON.stringify(wxMemberCardItemObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }

        let wxCardIds = wxMemberCardItemObj.items.map(cardItem=>cardItem.wxCardId);

        let wxMemberCardObj = await wxMemberCardItemsBusiness.models['wxMemberCard'].listAll({wxCardId:wxCardIds});
        if(wxMemberCardObj.items.length <= 0)
        {
            let errorData = 'WxMiniPrgService->loginWxMiniPrg not found part wxMemberCard error ' +
                +',wxMemberCardObj :' + JSON.stringify(wxMemberCardObj,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }

        let retCardItems = wxMemberCardItemObj.items.map(cardItem=>{
            let ownerCardUUID = cardItem.ownerCardUUID;
            let wxMemberCardFoundObj = _.find(wxMemberCardObj.items,wxMemberItem=>_.isEqual(wxMemberItem.wxCardId,cardItem.wxCardId));
            let shopUUID = wxMemberCardFoundObj ? wxMemberCardFoundObj.merchantUUID : null;
            let shopName = wxMemberCardFoundObj ? wxMemberCardFoundObj.brandName:null;
            return {ownerCardUUID,shopUUID,shopName};
        });

        console.log('WxMiniPrgService->loginWxMiniPrg retCardItems:' + JSON.stringify(retCardItems,null,2));

        return retCardItems;
    }


    async setPrgServerDomain(content,ctx )
    {
        let {merchantUUID,serverDomains} = content.body;
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,1);
        let reqParams = {
            "action":"set",
            "requestdomain":serverDomains.requestdomain,
            "wsrequestdomain":serverDomains.wsrequestdomain,
            "uploaddomain":serverDomains.uploaddomain,
            "downloaddomain":serverDomains.downloaddomain,
        };
        let setPrgServerDomainObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.setPrgServerDomainCmd,reqParams,
            {access_token:accessToken},'POST');
        console.log('WxOpenAccountBindBusiness->setPrgServerDomain ok ' );
        return setPrgServerDomainObj;
    }

    async setPrgBusiDomain(content,ctx )
    {
        let {merchantUUID,busiDomains} = content.body;
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,1);
        let reqParams = {
            "action":"set",
            "webviewdomain":busiDomains,
        };
        let setPrgBusiDomainObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.setPrgBusiDomainCmd,reqParams,
            {access_token:accessToken},'POST');
        console.log('WxOpenAccountBindBusiness->setPrgBusiDomainObj ok ' );
        return setPrgBusiDomainObj;
    }




}


module.exports = {
    urlRequestMap:[
        {name: 'queryWxPrgCardInfo', method: 'GET', url:'/api/:version/queryWxPrgCardInfo'},
        {name: 'setPrgServerDomain', method: 'POST', url:'/api/:version/setPrgServerDomain'},
        {name: 'setPrgBusiDomain', method: 'POST', url:'/api/:version/setPrgBusiDomain'},
    ],
    handler:new WxMiniPrgService(),
};

