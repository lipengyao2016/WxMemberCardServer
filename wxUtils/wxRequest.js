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

class WxRequest
{
    constructor()
    {

    }

    async sendRequest(requestCmd, data,urlParams,method = 'POST',reqType = 'JSON',formObj = {})
    {
        let reqUrl =`${wxConstantConfig.protocal}://${wxConstantConfig.wxServerDomain}${requestCmd}`;

        let qsData = qs.stringify(urlParams);
        if(!_.isEmpty(qsData))
        {
            reqUrl += `?${qsData}`;
        }

        let reqPostOptions = {
            simple: false,
            resolveWithFullResponse: true,
            method: method,
            uri:reqUrl,
            headers: {
             "Connection": 'Keep-Alive',
            },
        };

        if(reqType == 'JSON')
        {
            reqPostOptions['json'] = true;
            if(method == 'POST')
            {
                reqPostOptions['body'] = data;
            }
            else if(method == 'GET')
            {
                reqPostOptions['qs'] = data;
            }
        }
        else if(reqType == 'FORM')
        {
            reqPostOptions.headers['content-type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
            reqPostOptions['form'] = data;
        }
        else if(reqType == 'FILE')
        {
           // reqPostOptions['json'] = true;

           // reqUrl = 'http://192.168.7.188:6500/api/v1/fileUploadData';

            reqPostOptions.headers['content-type'] = 'multipart/form-data';
            reqPostOptions['formData'] = formObj;
        }

        console.log('WxRequest->sendRequest start url:' + reqUrl
           /* + 'reqPostOptions:' + JSON.stringify(reqPostOptions,null,2)*/
        );

        let wxRes  = await rp(reqPostOptions);

        if(wxRes.statusCode == 200)
        {
            let wxObj =  wxRes.body;

            if(_.isString(wxObj))
            {
                wxObj = JSON.parse(wxObj);
            }

            console.log('WxRequest->sendRequest ok url:' + reqUrl +
                ',wxObj:' + JSON.stringify(wxObj,null,2));

            if(_.has(wxObj,'errcode') && wxObj.errcode != 0)
            {
                let errorData = 'WxRequest->sendRequest communication error ' +
                   ', url:' + reqUrl + ',reqBody:' + JSON.stringify(data,null,2) +
                    ',wxObj :' + JSON.stringify(wxObj,null,2);
                console.error(errorData);
                let errObj = {
                    statusCode:wxRes.statusCode,
                    body:wxRes.body,
                    msg:errorData,
                };
                let err = new Error();
                err.name = 'wxError';
                err.message = JSON.stringify(errObj);
                throw err;
            }
            else
            {
                return wxObj;
            }
        }
        else
        {
            let errorData = 'WxRequest->sendRequest, url:' + reqUrl +
                ',params:' + JSON.stringify(data,null,2) +
                ',statusCode:' + wxRes.statusCode
                + ', body:' + wxRes.body;
            console.error(errorData);
            let errObj = {
                statusCode:wxRes.statusCode,
                body:wxRes.body,
                message:errorData,
            };
            throw new Error( {message:JSON.stringify(errObj)});
        }

    }


}

let  wxRequest= new WxRequest();
exports.wxRequest = wxRequest;