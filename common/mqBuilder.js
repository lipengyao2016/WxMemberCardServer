/**
 * Created by Administrator on 2018/4/24.
 */
const _ = require('lodash');
const moment = require('moment');
const devUtils = require('develop-utils');
const inflection = require( 'inflection' );
const cacheAble = require('componet-service-framework').cacheAble;
const utils = require('componet-service-framework').utils;


const  AmqpLibRecvClient= require('rabbit-config-client').amqpLibRecvClient;
const  AmqpLibSendClient= require('rabbit-config-client').amqpLibSendClient;

class MqBuilder
{
    constructor(mqName,mqServer,mqConfig)
    {
        this.mqName = mqName;
        this.mqServer = mqServer;
        this.mqConfig = mqConfig;

        this.bSenderReady = false;

        this.maxRetryCnt = 3;

      /*  this.recvFunc = recvFunc;
        this.ctx = ctx;
        this.createMQ(mqName,mqServer,mqConfig,recvFunc,ctx).then(data=>{
            console.log(`create MQ:${mqName} ok data:${data}`);
        })*/
    }

    setMaxRetrySendCnt(maxRetryCnt)
    {
        this.maxRetryCnt = maxRetryCnt;
    }

    async createSender()
    {
        let amqpServer = _.pick(this.mqServer,['host','port','user','password']);
        this.sendMsgClient = new AmqpLibSendClient(`${this.mqName}AmqpSender`,amqpServer);
        await this.sendMsgClient.Init(this.mqConfig.exchangeName, this.mqConfig.exchangeType,
            this.mqConfig.routeKey, this.mqConfig.queueName);

        this.bSenderReady = true;
    }

    async createRecver(recvFunc,ctx,requeueTime = 3000)
    {
        let amqpServer = _.pick(this.mqServer,['host','port','user','password']);
        this.recvMsgClient = new AmqpLibRecvClient(`${this.mqName}AmqpRecver`,amqpServer);
        await  this.recvMsgClient.Init(this.mqConfig.exchangeName, this.mqConfig.exchangeType,
            this.mqConfig.routeKey, this.mqConfig.queueName,{},{prefetchCnt:1});
        await  this.recvMsgClient.createRecverConsumer(this.mqConfig.queueName
            , this.recvMsg, this,requeueTime);

        this.recvFunc =recvFunc;
        this.recvCtx = ctx;

        this.requeueTime = requeueTime;

        return true;
    }


    async sendMsg(msg,expireTime = '')
    {
        if(!this.bSenderReady)
        {
            console.error('MqBuilder->sendMsg mqName:' + this.mqName + ',sender has not ready!!!');
            return false;
        }
        return await  this.sendMsgClient.sendMsg(this.mqConfig.exchangeName,this.mqConfig.routeKey,
            JSON.stringify(msg),expireTime);
    }


    async recvMsg(msgData)
    {
        let msgValue = msgData.content.toString();
        let msgObj = JSON.parse(msgValue);

        if(!msgObj['msgUUID'])
        {
            msgObj['msgUUID'] = devUtils.createUUID();
        }

        console.log('MqBuilder->recvMsg msgObj:' + JSON.stringify(msgObj,null,2));

        if(!this.recvFunc )
        {
            console.log(`recvMsg->handle event recvFunc is null,will continue!! msgUUID:${msgObj['msgUUID']}...`);
            return false;
        }

        let resultRet = false;
        let bNeedResend = false;
        try
        {
            resultRet = await this.recvFunc.call(this.recvCtx,msgObj);
        }
        catch(e)
        {
            console.error('recvMsg->handle event  error:' + e);
            if(!msgObj['retryCnt'])
            {
                console.log(`recvMsg->handle event first resend msg msgUUID:${msgObj['msgUUID']}...`);
                msgObj['retryCnt']  = 1;
                bNeedResend = true;
            }
            else if(msgObj['retryCnt'] < this.maxRetryCnt - 1)
            {
                msgObj['retryCnt'] += 1;
                console.log(`recvMsg->handle event  resend msg cnt: ${msgObj['retryCnt']},msgUUID:${msgObj['msgUUID']}...`);
                bNeedResend = true;
            }
            else
            {
                console.log(`recvMsg->handle event resend cnt exceed max cnt ,msgUUID:${msgObj['msgUUID']},will stop!!!`);
                msgObj['retryCnt'] += 1;
                bNeedResend = false;
            }

            if(bNeedResend)
            {
                let curCtx = this;
                setTimeout(function () {
                    console.log(`recvMsg->handle event failed,will resend msg,msgUUID:${msgObj['msgUUID']}...`);
                    curCtx.sendMsg(msgObj);
                },this.requeueTime * msgObj['retryCnt']);
            }
            return true;
        }


        console.log(`recvMsg->handle event  end. resultRet:${resultRet}`);
        return resultRet;
    }


}


module.exports = MqBuilder;

