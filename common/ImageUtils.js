/**
 * Created by Administrator on 2018/4/24.
 */
const _ = require('lodash');
const moment = require('moment');
const devUtils = require('develop-utils');
const inflection = require( 'inflection' );
const cacheAble = require('componet-service-framework').cacheAble;
const utils = require('componet-service-framework').utils;
const request = require('common-request').request;
const fs = require('fs');
const rp = require('request-promise');

class ImageUtils
{
    constructor()
    {

    }

    async downloadImage(imageUrl,imagePath)
    {
        return await  new Promise(function (resolve, reject) {
            let imageStream =   rp.get(imageUrl).pipe(fs.createWriteStream(imagePath));
            imageStream.on('finish', function () {
                resolve(imagePath);
            });
            imageStream.on('error', function(err){
                reject(err);
            });
        });
    }

    async uploadNetworkImage(fileServerUrl,imageUrl,tmpPath,formData)
    {
        let imageRetPath = await  this.downloadImage(imageUrl, `${tmpPath}//${devUtils.createUUID()}.jpg`);
        return await this.uploadLocalImage(fileServerUrl,imageRetPath,formData);
    }

    async uploadLocalImage(fileServerUrl,imagePath,formData = {})
    {
        let reqPostOptions = {
            simple: false,
            resolveWithFullResponse: true,
            method: 'POST',
            uri:fileServerUrl,
            headers: {
                "Connection": 'Keep-Alive',
            },
        };

        reqPostOptions.headers['content-type'] = 'multipart/form-data';
        formData['my_file'] = fs.createReadStream(imagePath);
        reqPostOptions['formData'] = formData;

        let uploadRes  = await rp(reqPostOptions);

        if(uploadRes.statusCode == 201 || uploadRes.statusCode == 200)
        {
            let uploadObj =  JSON.parse(uploadRes.body);
            console.log('ImageUtils->uploadLocalImage ok url:' + fileServerUrl +
                ',uploadObj:' + JSON.stringify(uploadObj,null,2));
            return uploadObj;
        }
        else
        {
            let errorData = 'WxRequest->sendRequest, fileServerUrl:' + fileServerUrl  +
                ',statusCode:' + uploadRes.statusCode
                + ', body:' + uploadRes.body;
            console.error(errorData);
            let errObj = {
                statusCode:uploadRes.statusCode,
                body:uploadRes.body,
                message:errorData,
            };
            throw new Error({message:JSON.stringify(errObj)});
        }
    }

}


let imageUtils = new ImageUtils();
module.exports = imageUtils;

/*imageUtils.uploadLocalImage('http://192.168.7.188:6701/api/v1/fileUpload',
    'C:\\Users\\Administrator\\Desktop\\data\\icon\\22.png',{uploadType: "mobile"}).then(data=>{
   console.log(' uploadLocalImage data: ' + JSON.stringify(data,null,2));
});*/


/*
imageUtils.uploadNetworkImage('http://192.168.7.188:6701/api/v1/fileUpload','http://wx.qlogo.cn/mmopen/8hticMzVaiaRSic7bsquHodaHFOgcahlUibp67SvZiaPxib1VwIialB9B6wAjo5j5t99YjkdNxaGcM2jPuHWialLu8NdWFWagEjicbJFG/0',
    'D://fileUpload//tmp',{uploadType: "mobile"}).then(data=>{
    console.log(' uploadNetworkImage data: ' + JSON.stringify(data,null,2));
});
*/
