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

class WxUserService
{
    constructor()
    {

    }

    async getWxUserInfo(openId,merchantUUID)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(merchantUUID);
        let queryUserInfoData ={
            openid:openId,
            lang:'zh_CN',
        };

        let ctx = this;
        return await new Promise(function (resolve, reject) {
            wxRequest.sendRequest(wxConstantConfig.payCmd.queryWxUserInfoCmd,queryUserInfoData,
                {access_token:accessToken},'GET').then(data=>{
                console.log('WxUserService->getWxUserInfo  success ' );

                resolve(data);
            })
                .catch(err=>{
                    console.log('WxUserService->getWxUserInfo  error:' + JSON.stringify(err) );
                    resolve(null);
                });
        })
    }

}

let wxUserService = new WxUserService();
module.exports = wxUserService;

