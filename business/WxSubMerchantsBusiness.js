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
const wxAccessTokenUtils = require('../wxService/WxAccessTokenUtils');

const wxRequest = require('../wxUtils/wxRequest').wxRequest;
const wxConstantConfig = require('../wxUtils/wxConstantConfig');
const wxMsgRecver = require('../wxService/WxMsgRecver');

class WxSubMerchantsBusiness extends BaseBusiness
{
    constructor()
    {
        super();
        wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.subMerchantCheckEvent,this.handleCheckSubMerchantEvent,this);
    }

    async create(data,ctx)
    {
        let merchantRes = await request.get(data.merchantHref);
        if(merchantRes.statusCode != 200)
        {
            let errorData = 'WxSubMerchantsBusiness->create get merchant info failed, by merchantHref, '  + data.merchantHref
                + ',body:' + JSON.stringify(merchantRes.body);
            console.error(errorData);
            throw new Error(errorData);
        }

        let merchantUUID = devUtils.getLastResourceUUIDInURL(data.merchantHref);

        data.logoUrl = merchantRes.body.icon;
        let wxLogoUrl = await this.businesses['wxImage'].uploadImage(data.logoUrl,merchantUUID);
        data.brandName = merchantRes.body.name;

        data.protocolMediaId = await this.businesses['wxImage'].uploadMedia(data.protocolUrl,'image',merchantUUID);
        data.agreementMediaId = await this.businesses['wxImage'].uploadMedia(data.agreementUrl,'image',merchantUUID);
        data.operatorMediaId = await this.businesses['wxImage'].uploadMedia(data.operatorUrl,'image',merchantUUID);

        let protocolEndAt = (new Date(data.protocolEndAt).getTime())/1000;

        let categoryList = await this.getCardCategory(merchantUUID);

        let firstCategoryObj = _.find(categoryList,categoryItem=>_.isEqual(categoryItem.category_name,'休闲娱乐'));
        if(!firstCategoryObj)
        {
            let errorData = 'WxSubMerchantsBusiness->create get first category info failed';
            console.error(errorData);
            throw new Error(errorData);
        }
        data.primaryCategoryId = firstCategoryObj.primary_category_id ;
        let secondCategoryObj = _.find(firstCategoryObj.secondary_category,categoryItem=>_.isEqual(categoryItem.category_name,'美容美发'));
        if(!firstCategoryObj)
        {
            let errorData = 'WxSubMerchantsBusiness->create get second category info failed';
            console.error(errorData);
            throw new Error(errorData);
        }
        data.secondaryCategoryId = secondCategoryObj.secondary_category_id;

        let wxSubMerchantsApplyData ={
            "info": {
                "brand_name": data.brandName,
                "logo_url": wxLogoUrl,
                "protocol": data.protocolMediaId,
                "agreement_media_id":data.agreementMediaId,
                "operator_media_id":data.operatorMediaId,
                "end_time": protocolEndAt,
                "primary_category_id": data.primaryCategoryId,
                "secondary_category_id": data.secondaryCategoryId
                }
        };
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let subMerchantObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.createSubMerchantCmd,wxSubMerchantsApplyData,
            {access_token:accessToken});
        console.log('WxSubMerchantsBusiness->create  success ' + 'merchant_id:' +subMerchantObj.info.merchant_id);

        data.wxSubMerchantId = subMerchantObj.info.merchant_id;
        data.status = 'checking';

        let curAppId = config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId : config.wxPublicNoInfo.normal.appId;
        data.wxAppId = curAppId;

        return  await super.create(data,ctx);
    }

    async getCardCategory(merchantUUID)
    {
        let categoryRedisKey = `wx_protocolCategory` ;
        let categoryCacheData = await redis.get(categoryRedisKey);
        if(!_.isEmpty(categoryCacheData))
        {
            console.log('WxSubMerchantsBusiness->getCardCategory from cache categoryCacheData:' + categoryCacheData);
            return categoryCacheData;
        }

        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let categoryObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.getCategoryCmd,{},
            {access_token:accessToken},'GET');
        console.log('WxSubMerchantsBusiness->getCardCategory  success ' );
        return categoryObj.category;
    }

    async handleCheckSubMerchantEvent(data,query)
    {
        let subMerchantId = data.MerchantId;
        let status = (data.IsPass == '1') ? 'approved' : 'rejected';
        let rejectReason = data.Reason;
        let subMerchantRes = await this.model.listAll({wxSubMerchantId:subMerchantId});
        console.log('WxSubMerchantsBusiness->handleCheckSubMerchantEvent subMerchantRes:' + JSON.stringify(subMerchantRes,null,2));
        if(subMerchantRes.items.length > 0)
        {
           let updateSubMerchantData = {
               uuid : subMerchantRes.items[0].uuid,
               status:status,
               rejectReason:rejectReason,
               modifiedAt:utils.getTimeStr(new Date(),true),
           };
           await this.update(updateSubMerchantData);
           return true;
        }
        else
        {
            let errorData = 'WxSubMerchantsBusiness->handleCheckSubMerchantEvent not find subMerchant, by subMerchantId, '  + subMerchantId;
            console.error(errorData);
            throw new Error(errorData);
        }

    }



}

let  wxSubMerchantsBusiness = new WxSubMerchantsBusiness();
module.exports = wxSubMerchantsBusiness;


/*
let wxSubMerchantsBusiness = new WxSubMerchantsBusiness();
wxSubMerchantsBusiness.getCardCategory().then(data=>{
    console.log(' getCardCategory data: ' + data);
});*/
