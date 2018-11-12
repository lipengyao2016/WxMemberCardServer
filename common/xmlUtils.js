const crypto = require('crypto');
const uuid = require('uuid');
const moment = require('moment');
const _ = require('lodash');
const inflection = require( 'inflection' );
const fs = require('fs');
const xml2js = require('xml2js');

const parseString =  xml2js.parseString;
const builder = new xml2js.Builder();

exports.xmlToObj = function(xmlData)
{
    return new Promise(function (resolve, reject) {
        parseString(xmlData,{ explicitArray : false, ignoreAttrs : true,explicitRoot:false }, function (err, result) {
           if(err)
           {
               reject(err);
           }
           else
           {
               resolve(result);
           }
        });
    })

}

exports.objToXml = function(srcData)
{
    return builder.buildObject(srcData);
}



/*
let userObj = {name : 'liming',age:20,sex:'man',addr:{provience:'广东',shi:'shenzhen',qu:'baoan'}};
let xmlData = exports.objToXml(userObj);
console.log('xmlData:' + xmlData);



xmlData = '<xml>\n' +
    '    <return_code><![CDATA[SUCCESS]]></return_code>\n' +
    '    <return_msg><![CDATA[OK]]></return_msg>\n' +
    '    <appid><![CDATA[wx2421b1c4370ec43b]]></appid>\n' +
    '    <mch_id><![CDATA[10000100]]></mch_id>\n' +
    '    <device_info><![CDATA[1000]]></device_info>\n' +
    '    <nonce_str><![CDATA[GOp3TRyMXzbMlkun]]></nonce_str>\n' +
    '    <sign><![CDATA[D6C76CB785F07992CDE05494BB7DF7FD]]></sign>\n' +
    '    <result_code><![CDATA[SUCCESS]]></result_code>\n' +
    '    <openid><![CDATA[oUpF8uN95-Ptaags6E_roPHg7AG0]]></openid>\n' +
    '    <is_subscribe><![CDATA[Y]]></is_subscribe>\n' +
    '    <trade_type><![CDATA[MICROPAY]]></trade_type>\n' +
    '    <bank_type><![CDATA[CCB_DEBIT]]></bank_type>\n' +
    '    <total_fee>1</total_fee>\n' +
    '    <coupon_fee>0</coupon_fee>\n' +
    '    <fee_type><![CDATA[CNY]]></fee_type>\n' +
    '    <transaction_id><![CDATA[1008450740201411110005820873]]></transaction_id>\n' +
    '    <out_trade_no><![CDATA[1415757673]]></out_trade_no>\n' +
    '    <attach><![CDATA[订单额外描述]]></attach>\n' +
    '    <time_end><![CDATA[20141111170043]]></time_end>\n' +
    ' </xml> ';

exports.xmlToObj(xmlData).then(data=>{
    console.log('obj data:' + JSON.stringify(data,null,2));
})
*/



