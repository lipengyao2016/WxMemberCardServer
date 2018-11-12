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
const wxSignUtils = require('../wxUtils/wxSignUtils').wxSignUtils;
const mqBuilder = require('../common/mqBuilder');
const co = require('co');

class OwnerMemberMsgRecver
{
    constructor()
    {
        this.memberCardMQ = new mqBuilder('memberCardBalanceMq',config.rabbitmq,config.rabbitmq.memberCardInfo);
        this.memberCardMQ.createRecver(this.recvMemberChangeMsg,this,3000).then(data=>{
            console.log('create memberCard mq recver ok..');
        });
        this.eventHandler = {};

        this.memberCardMQ.createSender().then(data=>{
            console.log('create memberCard mq sender ok..');
        });

        this.memberCardMQ.setMaxRetrySendCnt(20);

    }

    setEventHandler(fn,ctx)
    {
        console.log('OwnerMemberMsgRecver->setEventHandler ' );
        this.eventHandler.fn = fn;
        this.eventHandler.ctx = ctx;
    }


    async recvMemberChangeMsg(memberCardMsg)
    {
        console.log('OwnerMemberMsgRecver->recvMemberChangeMsg memberCardMsg:' + JSON.stringify(memberCardMsg,null,2));

        let {fn,ctx} = this.eventHandler;
        if(!fn)
        {
            console.error(`recvMemberChangeMsg->handle has no fn !!!.`);
            return true;
        }
        console.log(`recvMemberChangeMsg->handle event  start.`);
        let resultRet = await fn.call(ctx,memberCardMsg);
        return resultRet;
    }



}

let ownerMemberMsgRecver = new OwnerMemberMsgRecver();
module.exports = ownerMemberMsgRecver;

let memberBalanceChange = {
    ownerCardId:'6383941838524995',   //会员卡号。
    cardType:'count',  //卡类型，amount:储值卡，count:储次卡。
    tradeType:'recharge',  //交易类型，consume:消费，recharge:充值，refund:退款。
    tradeAt:'2018-10-15 11:12:10',  //交易时间。
    tradeValue:1200,   //交易值，如交易次数，交易金额。 不限次数为0次。
    leftValue:20000,  //剩余值，如余额，余次。

    consumeDetails:  //消费，退款次数明细显示，充值时不显示   (备注)
        [
            {
            name:'按摩',
            tradeValue:2,
            leftValue:12, //0：不限次数。
        },
            {
                name:'面膜',
                tradeValue:2,
                leftValue:12, //0：不限次数。
            },
            {
                name:'去痘',
                tradeValue:2,
                leftValue:12, //0：不限次数。
            },
            {
                name:'减肥',
                tradeValue:2,
                leftValue:12, //0：不限次数。
            },
            {
                name:'瘦身',
                tradeValue:2,
                leftValue:12, //0：不限次数。
            },
            {
                name:'美肤',
                tradeValue:2,
                leftValue:12, //0：不限次数。
            },
        ],

    rechargeDetails:{
        rechargeTaoCanName:'充1000购买20次按摩套餐',  //充值套餐名称。 (备注)
        rechargeAmount:1000,    //充值金额。
        giveAmount:20,         //赠送金额。
    },
};

/*setTimeout(function () {
    ownerMemberMsgRecver.memberCardMQ.sendMsg(memberBalanceChange).then(data=>{
       console.log('send memberCard msg ok!!!!');
    });
},6000);*/


