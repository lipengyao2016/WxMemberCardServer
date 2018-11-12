const crypto = require('crypto');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const inflection = require( 'inflection' );

// UUID操作工具集
exports.createUUID = ()=>{
    let uuid_md5 = null;
    do{
        let md5 = crypto.createHash('md5');
        uuid_md5 = md5.update(`${uuid.v1()}-${uuid.v4()}`).digest('base64');
    }while( uuid_md5.indexOf('/') != -1 || uuid_md5.indexOf('+') != -1);
    return uuid_md5.substr(0, uuid_md5.length-2);
};
exports.getResourceUUIDInURL = (url,name)=>{
    let reg = new RegExp( name );
    let result = reg.exec(url);
    if( !result ) return null;
    let subStr = url.substr(result['index'] + result[0].length+1);
    result = (new RegExp('/')).exec(subStr);
    if(!result) return subStr;
    subStr = subStr.substr(0,result['index']);
    return subStr;
};
exports.getLastResourceUUIDInURL = (url)=>{
    let reg = /\/[\w]{22}$/;
    let result = reg.exec(url);
    if( !result ) return null;
    return result[0].substr(1);
};

// Error 错误处理工具集
exports.isDBError = (error)=>error && error.code && error.errno && _.has(error, 'sql');
exports.DBError = (error)=>_.extend(error,{
    name: 'DBError',
    statusCode: 500,
    code: 5100,
    message:'Database server instruction execution fail.',
    description: `${error.code}(${error.errno} ${error.message}`
});
exports.errorReturn = (error)=>{
    if(!error){return {name:'Error',statusCode:500,code:9999,message:'Unknown Error',description:'',stack: (new Error()).stack};}
    if(error.isBoom){
        let data = error.data;
        let payload = error.output.payload;
        return {
            name : payload.error || 'Error',
            statusCode: payload.statusCode || 500,
            code : _.get(data,'code') ||9999,
            message :  payload.message || payload.error|| 'Unknown Error',
            description : _.get(data,'description') || "",
            stack : (error.stack) ? error.stack : 'no stack'
        };
    }
    else {
        return {
            name : ((error && error.name) ? error.name:'Error'),
            statusCode: error.statusCode || 500,
            code : ((error && error.code) ? error.code:9999),
            message : ((error &&error.message) ? error.message : 'Unknown Error'),
            description : ((error &&error.description) ? error.description : ''),
            stack : ((error&&error.stack) ? error.stack : 'no stack')
        };
    }
};

/*
exports.excludeAttrData = function (dataInfo, excludeAttribute) {
    let retDataInfo = {};
    for (var item in dataInfo) {
        if(!_.find(excludeAttribute, key=>item==key )){
            retDataInfo[item] = dataInfo[item];
        }
    }

    return retDataInfo;
};*/


exports.getTypeFromHref = function (srcHref) {
    let type;
    let ownerStrs = srcHref.split('/');
    if(ownerStrs.length > 2)
    {
        let ownerType = ownerStrs[ownerStrs.length-2];
        type = inflection.singularize(ownerType);
    }
    return type;
};

exports.generateNonticeStr = function(len)
{
    let SYMBOLS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let nonceChars = '';
    for (let index = 0; index < len; ++index) {
        nonceChars += SYMBOLS[_.random(0, SYMBOLS.length - 1)];
    }
    return nonceChars;
}

//console.log(exports.generateNonticeStr(32));