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

class WxMsgRecver
{
    constructor()
    {
        this.wxMemberCardMQ = new mqBuilder('wxMemberCard',config.rabbitmq,config.rabbitmq.wxMemberCardInfo);
        this.wxMemberCardMQ.createSender().then(data=>{
            console.log('create wxMemberCard mq sender ok..');
        });
        this.wxMemberCardMQ.createRecver(this.recvMemberCardMsg,this).then(data=>{
            console.log('create wxMemberCard mq recver ok..');
        });

        this.eventHandlerMap = {};

        this.wxMemberCardMQ.setMaxRetrySendCnt(5);
    }

    getMsgMQ()
    {
        return this.wxMemberCardMQ;
    }

    registerEventHandler(event,fn,ctx)
    {
        console.log('WxMemberCardBusiness->registerEventHandler event:' + event);
        let eventHandlerObj = {fn,ctx};
        this.eventHandlerMap[event] = eventHandlerObj;
    }



    async recvMemberCardMsg(wxMemberCardMsg)
    {
       // return true;

        let data = wxMemberCardMsg.body;
        let query = wxMemberCardMsg.query;
        if(!this.eventHandlerMap.hasOwnProperty(data.Event))
        {
            console.log(`recvMemberCardMsg->handle event:${data.Event} has no handler ,return!!!`);
            return true;
        }

        let {fn,ctx} = this.eventHandlerMap[data.Event];
        console.log(`recvMemberCardMsg->handle event ${data.Event} start.`);

        let resultRet = await fn.call(ctx,data,query);
        console.log(`recvMemberCardMsg->handle event ${data.Event} end.`);
        return true;
    }
}

let wxMsgRecver = new WxMsgRecver();
module.exports = wxMsgRecver;

