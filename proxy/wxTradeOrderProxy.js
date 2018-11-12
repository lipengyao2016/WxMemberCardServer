/**
 * Created by Administrator on 2018/4/24.
 */
const _ = require('lodash');
const moment = require('moment');
const devUtils = require('develop-utils');
const restRouterModel = require('rest-router-model');
let BaseBusiness = restRouterModel.BaseBusiness;
let getSchema = restRouterModel.getSchema;
let parse = restRouterModel.parse;
const DistritubeExtraTranction = require('componet-service-framework').distritubeExtraTranction;
const BaseProxyTranction = require('componet-service-framework').baseProxyTranction;

const config = require('../config/config');



class WxTradeOrderProxy extends BaseProxyTranction
{
    constructor(dbOperater,curModel,models)
    {
        super(dbOperater);

        this.knex = dbOperater;
        this.curModel = curModel;
        this.models = models;
    }

    async increaseTradeOrder(tradeOrder,bQueryOrderCnt)
    {
        let tradeOrderName = this.curModel.prototype.tableName;
        let knex = this.knex;

        let retData =  await this.buildTraction(knex,function (trx) {

                return knex(tradeOrderName).select().where('uuid', tradeOrder.uuid).forUpdate().transacting(trx)
                    .then(rows=>{
                        let oldData =rows[0];

                        if(bQueryOrderCnt)
                        {
                            oldData['queryOrderCnt'] += 1;
                            if(oldData['queryOrderCnt'] >= 6)
                            {
                                oldData['status'] = 'timeout';
                            }
                        }
                        else
                        {
                            oldData['notifyCnt'] += 1;
                            if(oldData['notifyCnt'] >= 6)
                            {
                                oldData['isNotifyed'] = 2;
                            }
                        }
                        oldData['modifiedAt'] =  moment().format('YYYY-MM-DD HH:mm:ss');

                        return this.update(knex,tradeOrderName,oldData,trx);
                    });
        });

        console.log('WxTradeOrderProxy->increaseTradeOrder retData:' + JSON.stringify(retData,null,2));

        return retData;
    }

}


module.exports = WxTradeOrderProxy;


