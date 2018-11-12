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
const ImageUtils = require('../common/ImageUtils');

class WxMiniPrgVersionBusiness extends BaseBusiness
{
    constructor()
    {
         super();
        // wxMsgRecver.registerEventHandler(wxConstantConfig.wxEvent.authSucedEvent,this.handleAuthSucedEvent,this);
    }


    async uploadCode(content,ctx)
    {
        let {merchantUUID,templateId,userCodeVersion,userCodeDesc,customerExtJson} = content.body;
        let wxAuthInfoRes = await this.models['WxAuthInfo'].listAll({merchantUUID:merchantUUID,serviceType:1});
        if(wxAuthInfoRes.items.length <= 0)
        {
            let errorData = 'WxMiniPrgVersionBusiness->uploadCode not found wxAuthInfo by  merchantUUID:' + merchantUUID;
            console.error(errorData);
            throw new Error(errorData);
        }
        let appId = wxAuthInfoRes.items[0].authAppId;
        customerExtJson.extAppid = appId;
        customerExtJson.extEnable = true;
        customerExtJson.directCommit = true;

        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,true);
        let reqParams = {
            "template_id":templateId,
            "ext_json":JSON.stringify(customerExtJson), //*ext_json需为string类型，请参考下面的格式*
            "user_version":userCodeVersion,
            "user_desc":userCodeDesc,
        };
        let uploadCodeObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.uploadCodeCmd,reqParams,
            {access_token:accessToken},'POST');
        console.log('WxMiniPrgVersionBusiness->uploadCode ok ' );

        let wxminiPrgVersionData = {
            merchantUUID:merchantUUID,
            appId:appId,
            templateId:templateId,
            userCodeVersion:userCodeVersion,
            userCodeDesc:userCodeDesc,
            customerExtJson:customerExtJson,
            status:'uploaded',
        };
        wxminiPrgVersionData = parse(this.resourceConfig,'WxMiniPrgVersion',wxminiPrgVersionData);

        let wxminiPrgVersionObj = await this.create(wxminiPrgVersionData);

        console.log('WxMiniPrgVersionBusiness->uploadCode wxminiPrgVersionObj: ' + JSON.stringify(wxminiPrgVersionObj,null,2) );

        return wxminiPrgVersionObj;
    }

    async getTestQrCode(content,ctx)
    {
        let {merchantUUID} = content.query;

        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,true);
        let fileServerURL = URIParser.baseResourcesURI('FileServer','fileUpload');
        let getTestQrCodeUrl = `${wxConstantConfig.protocal}://${wxConstantConfig.wxServerDomain}${wxConstantConfig.miniPrgCmd.getTestQRCodeCmd}?access_token=${accessToken}`;
        let qrCodeUploadObj = await ImageUtils.uploadNetworkImage(fileServerURL,getTestQrCodeUrl,config.tmpFilePath,
            {uploadType: "mobile"}) ;

        console.log('WxMiniPrgVersionBusiness->getTestQrCode ok qrCodeUploadObj:' + JSON.stringify(qrCodeUploadObj,null,2) );
        return qrCodeUploadObj;
    }


    async getCategory(content,ctx)
    {
        let {merchantUUID} = content.query;
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,true);
        let reqParams = {
        };
        let categoryObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.getCategoryCmd,reqParams,
            {access_token:accessToken},'GET');

        console.log('WxMiniPrgVersionBusiness->getCategory ok '  );
        return categoryObj;
    }

    async commitAudit(content,ctx)
    {
        let {merchantUUID,item_list} = content.body;
        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,true);
        let reqParams = {
            item_list:item_list
        };

        let wxMiniPrgInfo = await this.model.listAll({merchantUUID:merchantUUID,status:'uploaded',orderBy:'createdAt DESC'});
        if(wxMiniPrgInfo.items.length <= 0)
        {
            let errorData = 'WxMiniPrgVersionBusiness->commitAudit not found uploaded wxMiniPrgInfo by  merchantUUID:' + merchantUUID;
            console.error(errorData);
            throw new Error(errorData);
        }

        let wxMiniPrgObj = wxMiniPrgInfo.items[0];
        let commitAuditObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.commitAuditCmd,reqParams,
            {access_token:accessToken},'POST');
        let updateWxMiniPrgData = {
            uuid:wxMiniPrgObj.uuid,
            auditInfo:item_list,
            auditid:commitAuditObj.auditid,
            status:'commited',
            modifiedAt:utils.getTimeStr(new Date(),true),
        };

        let updateWxMiniPrgRet = await this.update(updateWxMiniPrgData);
        console.log('WxMiniPrgVersionBusiness->commitAudit ok updateWxMiniPrgRet:' + JSON.stringify(updateWxMiniPrgRet,null,2) );
        return updateWxMiniPrgRet;
    }



    async queryAuditStatus(content,ctx)
    {
        let {merchantUUID} = content.query;

        let wxMiniPrgInfo = await this.model.listAll({merchantUUID:merchantUUID,status:'commited',orderBy:'createdAt DESC'});
        if(wxMiniPrgInfo.items.length <= 0)
        {
            let errorData = 'WxMiniPrgVersionBusiness->queryAuditStatus not found uploaded wxMiniPrgInfo by  merchantUUID:' + merchantUUID;
            console.error(errorData);
            throw new Error(errorData);
        }
        let wxMiniPrgObj = wxMiniPrgInfo.items[0];

        let accessToken = await wxAccessTokenUtils.getAccessToken(merchantUUID,true);
        let reqParams = {
            auditid:wxMiniPrgObj.auditid,
        };
        let queryAuditObj = await wxRequest.sendRequest(wxConstantConfig.miniPrgCmd.queryAuditStatusCmd,reqParams,
            {access_token:accessToken},'POST');

        let status;
        if(queryAuditObj.status == 0)
        {
            status = 'audited';
        }
        else if(queryAuditObj.status == 1)
        {
            status = 'auditFailed';
        }
        if(!_.isEmpty(status))
        {
            let updateWxMiniPrgData = {
                uuid:wxMiniPrgObj.uuid,
                status:status,
                modifiedAt:utils.getTimeStr(new Date(),true),
            };
            let updateWxMiniPrgObj = await  this.update(updateWxMiniPrgData);
            console.log('WxMiniPrgVersionBusiness->queryAuditStatus updateWxMiniPrgObj:' + JSON.stringify(updateWxMiniPrgObj,null,2));
        }

        console.log('WxMiniPrgVersionBusiness->queryAuditStatus ok '  );
        return queryAuditObj;
    }


}


let wxMiniPrgVersionBusiness = new WxMiniPrgVersionBusiness();
module.exports = wxMiniPrgVersionBusiness;


/*let authSucedEventData = {
    body:{
        Event:wxConstantConfig.wxEvent.authSucedEvent,
        merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
        appId:'wxbc4ee34494150e2e',
        serviceType:1,
    },
    query:{
    }
};*/

/*
setTimeout(function () {
    wxMsgRecver.wxMemberCardMQ.sendMsg(authSucedEventData).then(data=>{
        console.log('send auth suced msg ok!!!!');
    });
},6000);
*/

