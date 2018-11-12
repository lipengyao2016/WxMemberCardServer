/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


describe('wxMemberCardItems Test Case:',()=>{
    let wxMemberCardBonusTestCase = {
        ownerCardId:'3104931836939328',
        addBonus:10,
        bonus:95,
    };

    let wxMemberCardBalanceTestCase = {
        ownerCardId:'3104931836939328',

        consumeAmount:10,
        balance:500,
        consumeCount:1,
        leftCount:12,
        consumeAt:'2018-9-10 12:15:10',
    };

    let applicationUUID = 'AppUUIDForTestCase';
    let wxMemberCardItemsUUID = null;

    let tenantUUID = null;
    let tenantURL = null;

    tenantURL = url ;

   // wxMemberCardItemsUUID = 'n6wjFnfhtA46MlO1hQWjIA';

    describe('create test case:',  ()=>{

        it('success updateMemberBonus ',  ()=> {
            //this.timeout(0);
            return request.post(`${tenantURL}/updateMemberBonus`,wxMemberCardBonusTestCase).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMemberCardItems test  updateMemberBonus body:'+JSON.stringify(body,null,2));
            });
        });

        it('success updateMemberBalance ',  ()=> {
            //this.timeout(0);
            return request.post(`${tenantURL}/updateMemberBalance`,wxMemberCardBalanceTestCase).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMemberCardItems test  updateMemberBalance body:'+JSON.stringify(body,null,2));
            });
        });


        it('success syncOwnerMember ',  ()=> {
            //this.timeout(0);
            let activeMemberInfo = {
                encryptCode:'e%2FZZn6tnN%2FpKhmM2f8XOXXiGFQ2Twim9cx46%2BIAwKnc%3D',
                wxCardId:'pNwkp0Y3HEEEmnqDFgEAP22zCjLo',
                openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
                activate_ticket:'fDZv9eMQAFfrNr3XBoqhb%2FjyaoEF8uXzzJAcUS5B9uU4TlD8wHKkXT2J7ELRP4v7TRuppaAuk%2Bip0G%2BiWnGmYsV6bikUPYv64C4xb6dZWYs%3D',
            };
            return request.post(`${tenantURL}/syncOwnerMember`,activeMemberInfo).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMemberCardItems test  syncOwnerMember body:'+JSON.stringify(body,null,2));
            });
        });


        it('success activeWxMemberCard ',  ()=> {
            //this.timeout(0);
            let activeMemberInfo = {
                 code:'243601333267',
                 wxCardId:'pNwkp0Y3HEEEmnqDFgEAP22zCjLo',
                 openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
                 ownerMemberCardId:'6383941838524995',
                 balance:300,
                 leftCount:20,
            };
            return request.post(`${tenantURL}/activeWxMemberCard`,activeMemberInfo).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('wxMemberCardItems test  activeWxMemberCard body:'+JSON.stringify(body,null,2));
            });
        });



    });
    describe('retrieve test case:', function () {
        it('success retrieve an wxMemberCardItems  ', function () {
            //this.timeout(0);

            return request.get(`${tenantURL}/wxMemberCardItems/${wxMemberCardItemsUUID}`,{}).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMemberCardItemss test retrieve   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
               // expect(body.name).to.equal(wxMemberCardItemsTestCase.name);
            });
        });

        it('success getWxUserInfoByActiveTicket ',  ()=> {
            //this.timeout(0);
            return request.get(`${tenantURL}/getWxUserInfoByActiveTicket`,{activate_ticket:'fDZv9eMQAFfrNr3XBoqhb%2FjyaoEF8uXzzJAcUS5B9uX%2F9aE9QirR8V0xsE2PiS4RQ2RnyanFZu55%2FAbMXxZrrD4vvuHMgFp82RF4sFA4ny4%3D'}).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('getWxUserInfoByActiveTicket test   body:'+JSON.stringify(body,null,2));
            });
        });

        it('success queryWxPrgCardInfo ',  ()=> {
            //this.timeout(0);
            return request.get(`${tenantURL}/queryWxPrgCardInfo`,{wxJSCode:'033nS9T004HipF1gUPU00PZrT00nS9TV'}).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('queryWxPrgCardInfo test   body:'+JSON.stringify(body,null,2));
            });
        });

        it('success findOwnerMemberByWxData ',  ()=> {
            //this.timeout(0);
            return request.get(`${tenantURL}/findOwnerMemberByWxData`,{
                wxCardId:'pNwkp0el3uHXpsjTQx_AqXgLmaOk',
               // openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
                ownerCardUUID:'YmnUQkB9uRJUFxXAVRiINQ',

            }).then( ( {statusCode, body, headers, request} )=>{
                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');

                console.log('findOwnerMemberByWxData test   body:'+JSON.stringify(body,null,2));
            });
        });


    });
    describe('update test case:', function () {
        it('success update an wxMemberCardItems', function () {
            //this.timeout(0);

            let updateInfo = {
                description : 'bbb descript',
            };

            return request.post(`${tenantURL}/wxMemberCardItems/${wxMemberCardItemsUUID}`,updateInfo).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMemberCardItemss test update   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                expect(body.description).to.equal(updateInfo.description);
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
            });
        });
    });
    describe('list test case:', function () {
        it('list wxMemberCardItemss  ', function () {
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
            return request.get(`${tenantURL}/wxMemberCardItems`,qs).then( ( { statusCode,body,headers,request} )=>{

                console.log('wxMemberCardItemss test list   :' + JSON.stringify(body,null,2));

                expect(statusCode).to.equal(200);
                expect(headers['content-type']).to.equal('application/json; charset=utf-8');
                //expect(uriReg.applicationURIReg.test(res.headers['location'])).to.be.true;
            });
        });
    });

    describe('delete test case:',()=>{
        it('success delete an wxMemberCardItems', function () {
            //this.timeout(0);
           // wxMemberCardItemsUUID = 'Zdw5JWKKDYXVcPD8ErNOTw';
          /*  return request.delete(`${tenantURL}/wxMemberCardItems/${wxMemberCardItemsUUID}`).then( ( { statusCode,body,headers,request} )=>{
                expect(statusCode).to.equal(204);
            });*/
        });
    });
});