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

class WxImageBusiness extends BaseBusiness
{
    constructor()
    {
         super();
    }

    async downloadImage(imageUrl,imagePath)
    {
        let originFileName = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        imagePath += `/${originFileName}`;

        return await  new Promise(function (resolve, reject) {

            let newImageUrl = imageUrl.replace('fms.laikoo.net','fms-laikoo-net');
            console.log('WxImageBusiness->downloadImage newImageUrl:' + newImageUrl);

            let imageStream =   rp.get(newImageUrl).pipe(fs.createWriteStream(imagePath));
            imageStream.on('finish', function () {
                resolve(imagePath);
            });

            imageStream.on('error', function(err){
                reject(err);
            });
        });

        /*let imageRet = await  request.get(imageUrl);
        if(imageRet.statusCode == 200)
        {
            let imageData = imageRet.body;

            let saveFileRet = await utils.saveFile(imagePath,imageData);
            return imagePath;
        }
        else
        {
            let errorData = 'WxImageUtils->downloadImage get image url file error ' +
                ', imageUrl:' + imageUrl + ',statusCode:' + imageRet.statusCode +
                ',body :' + JSON.stringify(imageRet.body,null,2);
            console.error(errorData);
            throw new Error(errorData);
        }*/
    }

    async uploadImage(imageUrl,merchantUUID)
    {
        let curAppId = config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId : config.wxPublicNoInfo.normal.appId;
        let wxImageRet = await this.listAll({orignUrl:imageUrl,
            appId: curAppId});
        if(wxImageRet.items.length > 0)
        {
            return wxImageRet.items[0].wxResourceUrl;
        }

        let imageRetPath = await  this.downloadImage(imageUrl,config.tmpFilePath);

        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let reqParams = {
            access_token:accessToken,
            type:'image',
        };

        let fileObj = {
            buffer:fs.createReadStream(imageRetPath),
        };

        let uploadImgObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.uploadImgCmd,{},reqParams,'POST','FILE',fileObj);
        fs.unlinkSync(imageRetPath);

        let wxImageData = {orignUrl:imageUrl,wxResourceUrl:uploadImgObj.url,appId:curAppId};
        wxImageData = parse(this.resourceConfig,'wxImage',wxImageData);

        await this.create(wxImageData);

        return uploadImgObj.url;
    }


    async uploadMedia(imageUrl,type = 'image',merchantUUID)
    {
        let curAppId = config.wxPublicNoInfo.userSandBox ? config.wxPublicNoInfo.sandbox.appId : config.wxPublicNoInfo.normal.appId;
        let cacheImageKey = imageUrl.replace(/\//g,'_');
        cacheImageKey = cacheImageKey.replace(/\./g,'@');
        cacheImageKey = cacheImageKey.replace(/\:/g,'#');

        let mediaImageRedisKey = `wxMediaCache_${curAppId}_${cacheImageKey}` ;
        let accessTokenData = await redis.get(mediaImageRedisKey);
        if(!_.isEmpty(accessTokenData))
        {
            console.log('WxImageBusiness->uploadMedia from cache accessTokenData:' + accessTokenData);
            return accessTokenData;
        }


        let imageRetPath = await  this.downloadImage(imageUrl,config.tmpFilePath);

        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let reqParams = {
            access_token:accessToken,
            type:type,
        };

        let fileObj = {
            media:fs.createReadStream(imageRetPath),
        };

        let uploadImgObj = await wxRequest.sendRequest(wxConstantConfig.payCmd.uploadMediaImgCmd,{},reqParams,'POST','FILE',fileObj);
        fs.unlinkSync(imageRetPath);

        await redis.setex(mediaImageRedisKey,3600 * 48,uploadImgObj.media_id);

        return uploadImgObj.media_id;
    }

}


let wxImageBusiness = new WxImageBusiness();
module.exports = wxImageBusiness;

/*
wxImageUtils.uploadImage('http://192.168.7.188:6500/upload/pnd/dd39674d84cc3b72921f1f4fa03804bd.png').then(data=>{
   console.log(' uploadImage data: ' + data);
});
*/
/*
let wxImageBusiness = new WxImageBusiness();
wxImageBusiness.uploadMedia('http://192.168.7.188:6500/upload/pnd/dd39674d84cc3b72921f1f4fa03804bd.png').then(data=>{
    console.log(' uploadMedia data: ' + data);
});
*/

/*
let url = 'http://fms.laikoo.net/upload/pnd/2425a8755f418915226281edbe380df2.png';
url = url.replace('fms.laikoo.net','fms-laikoo-net');
console.log(url);*/
