/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxAuthInfos Test Case:',()=>{
    let wxAuthInfosTestCase =
        {
            merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
            aliMerchantId:'10024',
            aliAppId:'20014',
            app_auth_token:'4845sdg4w8egsd',
            app_refresh_token:'dgwdgsdfsfsgg',
    };



    let ownerUUID = 'AppUUIDForTestCase';
    let wxAuthInfosUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url /*+ '/directories' + '/zbDG5Ul3MHzHOEBFYyIalQ' + '/wxAuthInfosPackages' + '/n97eIgDCIO6wecGkvc19UQ'*/ ;

    //wxAuthInfosUUID = 'mCw73gturM33O1WiZEZBdA';

    describe('create test case:',  ()=>{
        it('success create an wxAuthInfos',  ()=> {
            //this.timeout(0);

            return request.post(`${url}/wxAuthInfos`,wxAuthInfosTestCase).then( ( {statusCode, body, headers, request} )=>{

                console.log('wxAuthInfos test  create  body:'+JSON.stringify(body,null,2));

                expect(statusCode).to.equal(201);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                wxAuthInfosUUID = utils.getResourceUUIDInURL(body.href,'wxAuthInfos');

            });
        });

    });


    describe('retrieve test case:', function () {
        it('success retrieve an wxAuthInfos  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/getWxAuthUrl`,{merchantUUID:'82TaIejHrZp4aHaM9hG2DQ'}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxAuthInfos test getWxAuthUrl   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
               // expect(body.name).to.equal(wxAuthInfosTestCase.name);
            });
        });
    });
    describe('list test case:', function () {


        it('list wxAuthInfos  ', function () {
            //this.timeout(0);
            let qs = {
               // name:'*wxAuthInfo*',
                //uuid:['3UCHOeNl5tVmN83fkyQfNQ','V1bg0v8SlXKs8OXApykNzg'],
                /*               offset:0,
                               limit:1,
                               createdAt:'[,2018-04-18 18:13:28]'*/
                //wxAuthInfosPackageUUID:'xAdNYJaUdyyXyFmd1rFkUg',
               // orderBy:'uiOrder DESC',
              /*  ownerHref:'http://localhost:5000/api/v1.0.0/applications/BQZNqVpEbFxyZ7ayW7x2yA',
                expand:'operators',*/
              merchantUUID:'mI2NDMoQRdnKCq01hAsLwQ',
            };
            return request.get(`${url}/wxAuthInfos`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxAuthInfos test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
            });
        });

    });

    describe('delete test case:',()=>{
        it('success delete an wxAuthInfos', function () {
            //this.timeout(0);
           /* return request.delete(`${tenantURL}/wxAuthInfos/${wxAuthInfosUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });

    });
});