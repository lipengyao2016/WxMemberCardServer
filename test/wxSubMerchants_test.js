/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxSubMerchants Test Case:',()=>{
    let wxSubMerchantsTestCase =
        {
            merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
            protocolUrl:'http://192.168.7.188:6500/upload/pnd/e62973e3fa88aa536b6710dd060f5978.png',
            protocolEndAt: '2020-9-22',
            agreementUrl:'http://192.168.7.188:6500/upload/pnd/154baf6aa9bfd26bf4b316ea8e8701d5.png',
            operatorUrl:'http://192.168.7.188:6500/upload/pnd/293516e0a24f9da5b34766abd49f0edd.png',
           // wxAppId:'87451',
    };



    let ownerUUID = 'AppUUIDForTestCase';
    let wxSubMerchantsUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url /*+ '/directories' + '/zbDG5Ul3MHzHOEBFYyIalQ' + '/wxSubMerchantsPackages' + '/n97eIgDCIO6wecGkvc19UQ'*/ ;

    //wxSubMerchantsUUID = 'mCw73gturM33O1WiZEZBdA';

    describe('create test case:',  ()=>{
        it('success create an wxSubMerchants',  ()=> {
            //this.timeout(0);

            return request.post(`${url}/wxSubMerchants`,wxSubMerchantsTestCase).then( ( {statusCode, body, headers, request} )=>{

                console.log('wxSubMerchants test  create  body:'+JSON.stringify(body,null,2));

                expect(statusCode).to.equal(201);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                wxSubMerchantsUUID = utils.getResourceUUIDInURL(body.href,'wxSubMerchants');

            });
        });

    });


    describe('retrieve test case:', function () {
        it('success retrieve an wxSubMerchants  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/wxSubMerchants/${wxSubMerchantsUUID}`,{}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxSubMerchants test retrieve   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
               // expect(body.name).to.equal(wxSubMerchantsTestCase.name);
            });
        });
    });
    describe('list test case:', function () {


        it('list wxSubMerchants  ', function () {
            //this.timeout(0);
            let qs = {
               // name:'*wxSubMerchant*',
                //uuid:['3UCHOeNl5tVmN83fkyQfNQ','V1bg0v8SlXKs8OXApykNzg'],
                /*               offset:0,
                               limit:1,
                               createdAt:'[,2018-04-18 18:13:28]'*/
                //wxSubMerchantsPackageUUID:'xAdNYJaUdyyXyFmd1rFkUg',
               // orderBy:'uiOrder DESC',
              /*  ownerHref:'http://localhost:5000/api/v1.0.0/applications/BQZNqVpEbFxyZ7ayW7x2yA',
                expand:'operators',*/
             // merchantUUID:'mI2NDMoQRdnKCq01hAsLwQ',
            };
            return request.get(`${url}/wxSubMerchants`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxSubMerchants test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
            });
        });




    });

    describe('delete test case:',()=>{
        it('success delete an wxSubMerchants', function () {
            //this.timeout(0);
           /* return request.delete(`${tenantURL}/wxSubMerchants/${wxSubMerchantsUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });

    });
});