
const fs = require('fs');
const _ = require('lodash');

var wrapBusiApi =  function (busiApi,func) {
    return async (ctx, next) => {
        try {
            let content = {
                body:ctx.request.body,
                query:ctx.query,
                params:ctx.params,
            };
            let result =  await  func.call(busiApi,content,ctx);
            ctx.body = result;
            ctx.status = 200;
        }
        catch (e)
        {
            console.error(e);
            let body = {
                'name' : 'Error',
                'code' :9999,
                'message' : (e &&e.message) ? e.message : 'Unknown Error',
                'description' : (e &&e.description) ? e.description : '',
                'stack' : ((e&&e.stack) ? e.stack : 'no stack')
            };

            ctx.body = body;
            ctx.status = 500;

        }
    };
}

function registerRouter(router,url,method,func) {
    if (method == 'GET')
    {
        router.get(url, func);
        console.log(`register URL mapping: GET ${url}`);
    } else if (method == 'POST') {
        router.post(url, func);
        console.log(`register URL mapping: POST ${url}`);
    } else if (method =='DELETE') {
        router.delete(url, func);
        console.log(`register URL mapping: DELETE ${url}`);
    }
    else {
        console.log(`invalid URL: ${url}`);
    }
}

function addMapping(router, mapping) {
    let {handler,urlRequestMap} = mapping;

    if(handler && urlRequestMap && _.isArray(urlRequestMap))
    {
        urlRequestMap.map(urlReqItem=>{

            let handlerFunc = wrapBusiApi(handler,handler[urlReqItem.name]);
            if(_.isArray(urlReqItem.method))
            {
                urlReqItem.method.map(methodItem=>{
                    registerRouter(router,urlReqItem.url,methodItem,handlerFunc);
                });
            }
            else
            {
                registerRouter(router,urlReqItem.url,urlReqItem.method,handlerFunc);
            }

        });
        return true;
    }
    else
    {
        return false;
    }
}

function addFileControllers(router,dir) {
    var files = fs.readdirSync( dir);
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (var f of js_files) {
       // console.log(`process controller:  ${f} begin...`);
        let mapping = require( dir + '/' + f);
        let mappRet = addMapping(router, mapping);
       // console.log(`process controller: ${f} end,ret:${mappRet?'success':'failed'}`);
    }
}



module.exports = function (router,rootDir) {
    let api_dir = rootDir || 'controllers/api';// 如果不传参数，扫描目录默认为'controllers'

    addFileControllers(router,   __dirname + '/'+ api_dir);

    return true;
};