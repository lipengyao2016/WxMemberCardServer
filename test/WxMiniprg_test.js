/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxMiniPrg Test Case:',()=>{
 

    let applicationUUID = 'AppUUIDForTestCase';
    let wxMiniPrgUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url ;

   // wxMiniPrgUUID = 'n6wjFnfhtA46MlO1hQWjIA';

    describe('create test case:',  ()=>{

        it('success setPrgServerDomain ',  ()=> {
            //this.timeout(0);

            let testData = {
                merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
                serverDomains:{
                    "requestdomain":['http://prod.wx.icarcloud.net'],
                    "wsrequestdomain":['http://prod.wx.icarcloud.net'],
                    "uploaddomain":['http://prod.wx.icarcloud.net'],
                    "downloaddomain":['http://prod.wx.icarcloud.net'],
                },

            };

            return request.post(`${tenantURL}/setPrgServerDomain`,testData).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMiniPrg test  setPrgServerDomain body:'+JSON.stringify(body,null,2));
            });
        });


        it('success setPrgBusiDomain ',  ()=> {
            //this.timeout(0);

            let testData = {
                merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
                busiDomains:['test.wx.icarcloud.net'],
            };

            return request.post(`${tenantURL}/setPrgBusiDomain`,testData).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMiniPrg test  setPrgBusiDomain body:'+JSON.stringify(body,null,2));
            });
        });


    });
    describe('retrieve test case:', function () {
        it('success retrieve an wxMiniPrg  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/wxMiniPrg/${wxMiniPrgUUID}`,{}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgs test retrieve   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
               // expect(body.name).to.equal(wxMiniPrgTestCase.name);
            });
        });

    });
    describe('update test case:', function () {
        it('success update an wxMiniPrg', function () {
            //this.timeout(0);

            let updateInfo = {
                description : 'bbb descript',
            };

            return request.post(`${tenantURL}/wxMiniPrg/${wxMiniPrgUUID}`,updateInfo).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgs test update   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                expect(body.description).to.equal(updateInfo.description);
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
            });
        });
    });
    describe('list test case:', function () {
        it('list wxMiniPrgs  ', function () {
            //this.timeout(0);
            let merchantLists = [
                'RQZNqVpEbFxyZ7ayW7x2yA',
                'PQZNqVpEbFxyZ7ayW7x2yA'];
            let qs = {
               // name:'*good*',
                //uuid:['3UCHOeNl5tVmN83fkyQfNQ','V1bg0v8SlXKs8OXApykNzg'],
                /*               offset:0,
                               limit:1,
                               createdAt:'[,2018-04-18 18:13:28]'*/
               // ownerHref:'http://localhost:5000/api/v1.0.0/applications/AQZNqVpEbFxyZ7ayW7x2yA',
            };
            return request.get(`${tenantURL}/wxMiniPrg`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgs test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
            });
        });
    });

    describe('delete test case:',()=>{
        it('success delete an wxMiniPrg', function () {
            //this.timeout(0);
           // wxMiniPrgUUID = 'Zdw5JWKKDYXVcPD8ErNOTw';
          /*  return request.delete(`${tenantURL}/wxMiniPrg/${wxMiniPrgUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });
    });
});