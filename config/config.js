"use strict";
const fs = require('fs');
const _ = require('lodash');
let externHost = '192.168.7.188';

let config = {
    //服务器配置
    server: {
        domain : 'localhost',
        port : 6015,
    },
    //debug 为true时，用于本地调试
    debug : false,
    //接口统计开关
    record : false,
    // knex配置
    knex: {
        client: 'mysql',
        connection: {
            host : '192.168.7.6',
            user : 'root',
            password : '123456',
            database : 'WxMemberCardServerDB',
            port : 3306
        },
        pool : { min : 0, max : 10},
    },
    isSendSMS: true,
    //JWT
    // jwt: {
    //     secret: '123456',
    //     public_key : fs.readFileSync(__dirname + '/../ssl/jwt_rsa/jwt_rsa_public_key.pem')
    // },
    signKey: 'eyJ1c2VyIjp7ImhyZWYiOiJodHRwOi8vMTkyLjE2OC43LjIwMjo1MDAzL2FwaS',
    //kafka
    kafka: {
        zkConnInfo: '192.168.7.166:2181',
        // host: '192.168.7.166',  // 192.168.7.166:2181, 192.168.7.167:2181, 192.168.7.168:2181
        // port: '2181'
    },
    //redis配置
    redis: {
        host : '192.168.7.150',
        port : 6379,
        db : 0,
        password : ''
    },


    cache : {
        // 缓存开关控制
        open : false,
        // 缓存失效时间,单位ms
        time : 1000,
    },
    
    
    rabbitmq:{
        host : '192.168.7.188',
        port : 5672,
        user : 'admin',
        password : 'admin',

        wxMemberCardInfo:{
            exchangeName : 'exchange_wxMemberCard',
            exchangeType : 'direct',
            routeKey : 'wx_member_card_active',
            queueName : 'queue_wxMemberCard',
        },

        memberCardInfo:{
            exchangeName : 'exchange_memberCard',
            exchangeType : 'direct',
            routeKey : 'member_card_balance_change',
            queueName : 'queue_memberCard_balance',
        },
    },

    wxMiniPrgInfo:{
        appId:'wxbc4ee34494150e2e',
        appSecret:'e08004e39aa7bfc907b6139e03dcdf55',
    },

    wxThridPlatformInfo:{
        appId:'wx59e6d047bda1ef14',
        appSecret:'b71e126ea952d69cbd2cf8cc806c75e0',
        msgToken:'meiye',
        msgKey:'9iVfkikUnkoQGr3gOaWilUoJqIex2ZigBU8RVRud73a',
        authRedirectUrl:'http://test.wx.icarcloud.net/kataiWxMemberCardServer/api/v1/onAuthRet',
        userThirdPlatform:true,
    },

    wxPublicNoInfo:{

        normal:
        /** 2018/9/5  靠谱儿
         lpy-modifyed  */
 /*           {
                appId:'wx17fa0e701f1e8960',
                appSecret:'afaea4360dfb7cb651ab161f84914541',
                consumeTemplateId:'bm3fou5Wj7vbh6_2mPBdiMDPubSJoSJ66dysCNysPj8',
            },*/

        /** 2018/9/5  卡钛。
         lpy-modifyed  */
            {
                appId:'wxbdca4ea29ec28344',
                appSecret:'4165b222355c83753cf024d3226b81a8',
                consumeTemplateId:'zhcKAHnmu2UZOkLTwVRiGLX2-cywOcgZxZA8PmhU3bU',
            },

        sandbox:
            {
                appId:'wx973b674593110416',
                appSecret:'ff160425740fa7c19019e8e35d16dd73',
            },
        userSandBox:false,
        wxToken:'kaopuer',

        memberCard:
            {
                wx_activate_after_submit_url:'http://test.wx.icarcloud.net/testActiveWebServer/wxUtils/wxUtils.html',
                balance_url:'http://www.qq.com',
                leftCnt_url:'http://www.baidu.com',
                cardBalance_url:'http://www.sina.com',
                payCard_url:'http://www.taobao.com',
                rechargeCard_url:'https://www.tmall.com',
            },

    },


    ThirdServerByCommonConfig: {
        MEMBER_SERVER:'MemberServer',
        AUTH_SERVER:'AuthServer',
        FILE_SERVER:'FileServer',
    },

    MemberServer:{
        host: externHost,
        port: 6014
    },

    AuthServer:{
        host: externHost,
        port: 6100
    },

    FileServer:{
        host: externHost,
        port: 6701
    },

    tmpFilePath:'D://fileUpload//tmp',  // '/tmp'
 //   tmpFilePath:'/tmp',


    configServerUrl:'',

    eurekaServer:
        {
            host : '',
            port : 0,
        },

    isOpenMQLogger:true,


};

// 从全局上层CommonConfig中读取环境变量
try {
    const commonConfig = require('../../CommonConfig/serverConfig');
    let {server_domain=null,ThirdServer_domain=null,knex_connection=null,redis=null,kafkaConfig=null,configServerUrl=null}=commonConfig;

    if(server_domain){config.server.domain = server_domain;}
    if(ThirdServer_domain && config.ThirdServerByCommonConfig){
        config.ThirdServerByCommonConfig.map( key=>{
            config[key].host=ThirdServer_domain;
        } );
    }
    if( knex_connection && config.knex.connection ){
        Object.keys(knex_connection).map(key=>{
            config.knex.connection[key] = knex_connection[key];
        });
    }
    if (redis && config.redis){
        Object.keys(redis).map(key=>{
            config.redis[key] = redis[key];
        });
    }
    if ( kafkaConfig && config.kafka ){
        Object.keys(kafkaConfig).map(key=>{
            config.kafka[key] = kafkaConfig[key];
        });
    }
    if(configServerUrl && config.configServerUrl)
    {
        config.configServerUrl = configServerUrl;
    }
    console.log('The read common config. config:' + JSON.stringify(config));
}
catch(e) {
    console.warn('The common config does not exist!!!');
}



//从环境变量中覆盖配置参数，及默认优先使用环境变量参数
function readEnvParams( obj , prefix = null) {
    prefix = prefix ? prefix+'_' :'';
    Object.keys( obj ).map( key =>{
        let param = prefix+key;
        if( typeof obj[key] == 'object' ){
            readEnvParams( obj[key], param )
        }
        else {
            let env = param.toUpperCase();
            if( process.env[env] ){
                console.log(`Read ENV ${env}`);
                obj[key] = process.env[env];
            }
        }
    });
}
readEnvParams(config);

async  function readConfigServerParams() {

    if(!_.isEmpty(config.configServerUrl))
    {
        const apollConfig = require('apoll-config').apollConfig;
        const packageConfig = require('../package');
        console.log('read configServer URL from env configServerUrl:' + JSON.stringify(config.configServerUrl));
        return await  apollConfig.readConfigFromConfigServer(packageConfig.name,config.configServerUrl,config);
    }
}
config.readConfigServerParams = readConfigServerParams;

module.exports = config;