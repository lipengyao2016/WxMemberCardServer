/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxMiniPrgVersions Test Case:',()=>{
    let wxMiniPrgVersionsTestCase =
        {
            merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
            templateId:1,
            userCodeVersion:'v1.0.3',
            userCodeDesc:'第一版发布',
            customerExtJson:{
                "ext": {
                    "name": "meiye",
                    "attr": {
                        "shopname": "laikooshop",
                    }
                },
                "extPages": {
                    "pages/logs/logs": {
                        "navigationBarTitleText": "logs"
                    },
                    "pages/index/index": {
                        "navigationBarTitleText": "index"
                    },
                    "pages/member/member": {
                        "navigationBarTitleText": "member"
                    },
                },
            },
    };



    let ownerUUID = 'AppUUIDForTestCase';
    let wxMiniPrgVersionsUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url /*+ '/directories' + '/zbDG5Ul3MHzHOEBFYyIalQ' + '/wxMiniPrgVersionsPackages' + '/n97eIgDCIO6wecGkvc19UQ'*/ ;

    //wxMiniPrgVersionsUUID = 'mCw73gturM33O1WiZEZBdA';

    describe('create test case:',  ()=>{
        it('success create an wxMiniPrgVersions',  ()=> {
            //this.timeout(0);
            return request.post(`${url}/uploadCode`,wxMiniPrgVersionsTestCase).then( ( {statusCode, body, headers, request} )=>{

                console.log('wxMiniPrgVersions test  create  body:'+JSON.stringify(body,null,2));
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });

    });


    describe('retrieve test case:', function () {
        it('success retrieve an wxMiniPrgVersions  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/WxMiniPrg/getTestQrCode`,{merchantUUID:'82TaIejHrZp4aHaM9hG2DQ'}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgVersions test getTestQrCode   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
               // expect(body.name).to.equal(wxMiniPrgVersionsTestCase.name);
            });
        });

        it('success retrieve an getCategory  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/WxMiniPrg/getCategory`,{merchantUUID:'82TaIejHrZp4aHaM9hG2DQ'}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgVersions test getCategory   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
                // expect(body.name).to.equal(wxMiniPrgVersionsTestCase.name);
            });
        });

        it('success commitAudit   ', function () {
            //this.timeout(0);

            let commitData = {
                merchantUUID:'82TaIejHrZp4aHaM9hG2DQ',
                item_list:[
                    {
                        "address":"pages/member/member",
                        "tag":"会员",
                        "first_class": "生活服务",
                        "second_class": "丽人",
                        "third_class": "美容",
                        "first_id": 150,
                        "second_id": 185,
                        "third_id": 820,
                        "title": "会员"
                    },
                ]
            };
            return request.post(`${tenantURL}/WxMiniPrg/commitAudit`,commitData).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgVersions test commitAudit   :' + JSON.stringify(body,null,2));
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
            });
        });


        it('success retrieve an queryAuditStatus  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/WxMiniPrg/queryAuditStatus`,{merchantUUID:'82TaIejHrZp4aHaM9hG2DQ'}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgVersions test queryAuditStatus   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
                // expect(body.name).to.equal(wxMiniPrgVersionsTestCase.name);
            });
        });





    });
    describe('list test case:', function () {


        it('list wxMiniPrgVersions  ', function () {
            //this.timeout(0);
            let qs = {
               // name:'*wxMiniPrgVersion*',
                //uuid:['3UCHOeNl5tVmN83fkyQfNQ','V1bg0v8SlXKs8OXApykNzg'],
                /*               offset:0,
                               limit:1,
                               createdAt:'[,2018-04-18 18:13:28]'*/
                //wxMiniPrgVersionsPackageUUID:'xAdNYJaUdyyXyFmd1rFkUg',
               // orderBy:'uiOrder DESC',
              /*  ownerHref:'http://localhost:5000/api/v1.0.0/applications/BQZNqVpEbFxyZ7ayW7x2yA',
                expand:'operators',*/
              merchantUUID:'mI2NDMoQRdnKCq01hAsLwQ',
            };
            return request.get(`${url}/wxMiniPrgVersions`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMiniPrgVersions test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.ownerURIReg.test(res.headers['location'])).to.be.true;
            });
        });

    });

    describe('delete test case:',()=>{
        it('success delete an wxMiniPrgVersions', function () {
            //this.timeout(0);
           /* return request.delete(`${tenantURL}/wxMiniPrgVersions/${wxMiniPrgVersionsUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });

    });
});