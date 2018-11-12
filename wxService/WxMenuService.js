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

class WxMenuService
{
    constructor()
    {

    }

    async queryMenu(data)
    {
        let accessToken = await  wxAccessTokenUtils.getAccessToken(data.merchantUUID);
        let queryMenuRet = await wxRequest.sendRequest(wxConstantConfig.menuCmd.queryMenuCmd,
            {}, {access_token:accessToken});
        return queryMenuRet;
    }
}

let wxMenuService = new WxMenuService();
module.exports = wxMenuService;

/*
wxMenuService.queryMenu().then(data=>{
   console.log('queryMenu data:' + data);
});
*/

