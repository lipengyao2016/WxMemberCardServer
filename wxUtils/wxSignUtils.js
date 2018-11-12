const _ = require('lodash');
const moment = require('moment');

const utils = require('../common/utils');
const xmlUtils = require('../common/xmlUtils');
const crypto = require('crypto');
const config = require('../config/config');
const wxConstantConfig = require('./wxConstantConfig');
const request = require('common-request').request;
const rp = require('request-promise');
const qs = require('query-string');

class WxSignUtils
{
    constructor()
    {

    }

    verify(timestamp, nonce, signature, token)
    {
        let currSign, tmp;
        tmp = [token, timestamp, nonce].sort().join("");
        currSign = crypto.createHash("sha1").update(tmp).digest("hex");
        return (currSign === signature);
    }

    generateSign(timestamp, nonce, token)
    {
        let currSign, tmp;
        tmp = [token, timestamp, nonce].sort().join("");
        currSign = crypto.createHash("sha1").update(tmp).digest("hex");
        return currSign;
    }


}

let  wxSignUtils= new WxSignUtils();
exports.wxSignUtils = wxSignUtils;


/*let dateTimestamp = new Date().getTime() + '';
let nonce = 'wx973b674593110416';
let sign = wxSignUtils.generateSign(dateTimestamp,nonce,config.wxPublicNoInfo.wxToken);
console.log('generateSign:' + sign + ',dateTimestamp:' + dateTimestamp);*/

/*
let verifySignRet = wxSignUtils.verify(dateTimestamp,nonce,sign,config.wxPublicNoInfo.wxToken);
console.log('verifySignRet:' + verifySignRet);
*/

