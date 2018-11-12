/**
 * Created by Administrator on 2018/1/8.
 */

const log4js = require('./log4js.v2');
const config = require('./config/config');
const _ = require('lodash');
config.readConfigServerParams().then(data=> {

    console.log('readConfigServerParams  config:'+ JSON.stringify(config,null,2));

    const package = require('./package.json');
    const resourceConfig = require('./config/resourceConfig');

    const restRouterModel = require('rest-router-model');

// 依次从系统环境变量、配置文件（配置环境或文件）读取服务端口，默认为3000

    const server_name = package.name;
    const ip = config.server.domain;
    const port = process.env.PORT || config.server.port || '3000';


    let wxMemberCardBusiness = require('./business/WxMemberCardBusiness');
    let wxImageBusiness = require('./business/WxImageBusiness');
    let wxMemberCardItemsBusiness = require('./business/WxMemberCardItemsBusiness');
    let wxSubMerchantsBusiness = require('./business/WxSubMerchantsBusiness');
    let wxAuthInfoBusiness = require('./business/WxAuthInfoBusiness');
    let WxOpenAccountBindBusiness = require('./business/WxOpenAccountBindBusiness');
    let WxMiniPrgVersionBusiness = require('./business/WxMiniPrgVersionBusiness');


    extendBusinesses = {
        wxMemberCard: wxMemberCardBusiness,
        wxImage: wxImageBusiness,
        wxMemberCardItem: wxMemberCardItemsBusiness,
        wxSubMerchant: wxSubMerchantsBusiness,
        WxAuthInfo:wxAuthInfoBusiness,
        WxOpenAccountBind:WxOpenAccountBindBusiness,
        WxMiniPrgVersion:WxMiniPrgVersionBusiness,
    };

    const Koa = require('koa');
    const KoaRouter = require('koa-router');
    const logger = require('koa-logger');

    const appKoa = new Koa();

    const app =require('koa-qs')(appKoa, 'extended');

    const jsonExpand = require('koa-json-url-expand');

    app.use(logger());
    app.use(jsonExpand.routerPlugin);

    let options = {
        serverName: server_name,
        ip: ip,
        port: port
    };

    restRouterModel.koaRestRouter(resourceConfig, extendBusinesses, config.knex, options).then(koa_router=>{

  /*      const koabody = require('koa-body');
        app.use(koabody({}));*/


/*        app.use(async (ctx,next)=>{
            const raw = require('raw-body');
            if(ctx.method == 'POST')
            {
                if(ctx.header['content-type'].indexOf('json') < 0)
                {
                    raw(ctx.req, {}).then(str=>{
                        console.log('body parse str:' +str.toString());
                    })
                }
            }

            await next();
        });*/


        const xmlParser = require('koa-xml-body');
        app.use(xmlParser({
            xmlOptions: {
                explicitArray: false,
                ignoreAttrs : true,
                explicitRoot:false
            },
        }));

        const bodyparser = require('koa-bodyparser');
        app.use(bodyparser());

        const routerRegister = require('./routerRegister');
        routerRegister(koa_router,'wxService');

        app.use(koa_router.routes());

        app.use(async (ctx,next)=>{

            ctx.set("Access-Control-Allow-Origin",'*');

            if(ctx.method == 'POST' || ctx.method == 'PUT'){
                console.log(`last koa -->body:\n${JSON.stringify(ctx.request.body,null,2)}`);
            }
            else if(ctx.method == 'GET' || ctx.method == 'DELETE')
            {
                console.log(`last koa -->query:\n${JSON.stringify(ctx.query,null,2)}`);
            }
            await next();
        });



        let server = app.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);

        if(!_.isEmpty(config.eurekaServer.host))
        {
            const EurekaClientConfig = require('eureka-config-client').eurekaClientConfig;
            let eurekaClient = new EurekaClientConfig(server_name,config/*,3000,3000*/);
            let registerServerTimer = setInterval(() => {
                console.log('register service start' );
                eurekaClient.registerService().then(data=>{
                    console.log('register data:' + data);
                    clearInterval(registerServerTimer);
                });
            }, 3000);
        }


    });




// Event listener for HTTP server "error" event.
    function onError(error) {
        if(error.syscall !== 'listen'){ throw error; }
        let bind = typeof port === 'string' ? (`pipe ${port}`) : (`port ${port}`);
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error('[Server Start] --> '+bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('[Server Start] --> '+bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
//Event listener for HTTP server "listening" event.
    function onListening() {
        let addr = this.address();
        let bind = typeof addr === 'string' ? (`pipe ${addr}`) : (`port ${addr.port}`);

        console.log(`[Server Start] --> ${server_name} listening on ${bind}`);
    }


});




