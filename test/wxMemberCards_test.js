/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxMemberCards Test Case:',()=>{
    let wxMemberCardsTestCase =
        {
            merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
            title:'小李快餐店ii会员卡',
            brandName:'小李快餐店ii',
          //  logoUrl:'http://fms.laikoo.net/upload/pnd/2425a8755f418915226281edbe380df2.png',
            logoUrl:'http://192.168.7.188:6500/upload/pnd/1bb87d41d15fe27b500a4bfcde01bb0e.png',
            backgroudUrl:'http://192.168.7.188:6500/upload/pnd/1abb2dc3d76311944ffdbe9980fbaadd.jpg',
            quatity:5000,
            notice: "使用时向服务员出示此券",
            date_info:{
                type:'DATE_TYPE_FIX_TIME_RANGE',
                begin_timestamp:parseInt(new Date().getTime() / 1000),
                end_timestamp:parseInt(new Date('2019-9-30').getTime() / 1000),
            },
            servicePhone:'0755-52147841',
            "time_limit": [
                {
                    "type": "MONDAY",
                    "begin_hour":0,
                    "end_hour":10,
                    "begin_minute":10,
                    "end_minute":59
                },
                {
                    "type": "TUESDAY"
                },
                {
                    "type": "WEDNESDAY"
                },
                {
                    "type": "THURSDAY"
                },
                {
                    "type": "FRIDAY"
                },
            ],
            "business_service": [
                "BIZ_SERVICE_FREE_WIFI",  //免费WIFI
                "BIZ_SERVICE_WITH_PET",   //可带宠物。
                "BIZ_SERVICE_FREE_PARK",  //免费停车。
                "BIZ_SERVICE_DELIVER"     //可以外带。
            ],
            description: "不可与其他优惠同享",
            "text_image_list": [
                {
                    "image_url": "http://192.168.7.188:6701/upload/pnd/41591338e24a17f4b42d1f1a75ceafdf.jpg",
                    "text": "此菜品精选食材，以独特的烹饪方法，最大程度地刺激食 客的味蕾",
                },
            ],
            prerogative:'买单消费送积分',
       };

    let wxMemberCardQRCodesTestCase =
        {
            merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
           // wxCardId:'pNwkp0XAkLHStjPPwMUWqm8f2plA',
        };

    let wxMemberCardWhiteListTestCase =
        {
            merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
            userName:['lipengyao2015'],
        };

    let ownerUUID = 'AppUUIDForTestCase';
    let wxMemberCardsUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url /*+ '/directories' + '/zbDG5Ul3MHzHOEBFYyIalQ' + '/wxMemberCardsPackages' + '/n97eIgDCIO6wecGkvc19UQ'*/ ;

    //wxMemberCardsUUID = 'zGVbAnrhVtP1Li75QLZ2yQ';

    let channel = 'wxUtils';

    describe('create test case:',  ()=>{
        it('success create an wxMemberCards',  ()=> {
            //this.timeout(0);

            return request.post(`${url}/wxMemberCards`,wxMemberCardsTestCase).then( ( {statusCode, body, headers, request} )=>{
                console.log('wxMemberCards test  create  body:'+JSON.stringify(body,null,2));
                expect(statusCode).to.equal(201);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });

        it('success create an wxMemberCardQRCode',  ()=> {
            //this.timeout(0);

            return request.post(`${url}/wxMemberCardQRCode`,wxMemberCardQRCodesTestCase).then( ( {statusCode, body, headers, request} )=>{

                console.log('wxMemberCardQRCode test  create  body:'+JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

            });
        });


        it('success create an wxMemberCardTestWhiteList',  ()=> {
            //this.timeout(0);

            return request.post(`${url}/wxMemberCardTestWhiteList`,wxMemberCardWhiteListTestCase).then( ( {statusCode, body, headers, request} )=>{

                console.log('wxMemberCardQRCode test  create  body:'+JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

            });
        });


        it('success post an onRecvWxMsg',  ()=> {
            //this.timeout(0);
            return request.post(`${url}/onRecvWxMsg`,wxMemberCardWhiteListTestCase).then( ( {statusCode, body, headers, request} )=>{
                console.log('onRecvWxMsg test  post  body:'+JSON.stringify(body,null,2));
                expect(statusCode).to.equal(200);
            });
        });

        it('success get an onRecvWxMsg',  ()=> {
            //this.timeout(0);

            let signData = {
                timestamp:'1535528409',
                nonce:'682366112',
                signature:'4bc9080b42482af45191cdced756a480782ea5f0',
                echostr:'8446952636947595257',
            };

            return request.get(`${url}/onRecvWxMsg`,signData).then( ( {statusCode, body, headers, request} )=>{
                console.log('onRecvWxMsg test  get  body:'+JSON.stringify(body,null,2));
                expect(statusCode).to.equal(200);
            });
        });



        it('success get an countWxMemberGetCardsCnt',  ()=> {
            //this.timeout(0);

            return request.get(`${url}/countWxMemberGetCardsCnt`,{merchantUUID:'82TaIejHrZp4aHaM9hG2DQ'}).then( ( {statusCode, body, headers, request} )=>{
                console.log('countWxMemberGetCardsCnt test  get  body:'+JSON.stringify(body,null,2));
                expect(statusCode).to.equal(200);
            });
        });





    });

    describe('update test case:', function () {
        it('success update an wxMemberCards', function () {
            //this.timeout(0);
            let updateInfo = {
                status:'success',
                "thirdOrderNo": 'WX245176121',
                "resultReason": 'payOk',
                isNotifyed:1
            };

            return request.post(`${tenantURL}/wxMemberCards/${wxMemberCardsUUID}`,updateInfo).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMemberCards test update   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });

    });
    describe('list test case:', function () {


        it('list wxMemberCards  ', function () {
            //this.timeout(0);
            let qs = {
                merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
            };
            return request.get(`${url}/wxMemberCards`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMemberCards test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
            });
        });

        it('get sandBoxKey  ', function () {
            //this.timeout(0);
            let qs = {
                channel:'wxUtils',
            };
            return request.get(`${url}/sandBoxKey`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('sandBoxKey test get   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });

        it('list orderQuery  ', function () {
            //this.timeout(0);
            let qs = {
                channel:'ali',
                merchantId:'2088231157987986',
                merchantOrderNo:'201808150009',
                app_auth_token:'201808BB589c8c58e23c48d3b7ef9c61fc6b4X98',

            };
            return request.get(`${url}/orderQuery`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('orderQuery test get   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });


        it('list refundQuery  ', function () {
            //this.timeout(0);
            let qs = {
                   channel:'ali',
                   merchantId:'2088231157987986',
                   merchantOrderNo:'301808150010',
                   sourceOrderNo:'201808150010',
                   app_auth_token:'201808BB589c8c58e23c48d3b7ef9c61fc6b4X98',
            };
            return request.get(`${url}/refundQuery`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('refundQuery test get   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });






    });

    describe('delete test case:',()=>{
        it('success delete an wxMemberCards', function () {
            //this.timeout(0);
           /* return request.delete(`${tenantURL}/wxMemberCards/${wxMemberCardsUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });
    });
});