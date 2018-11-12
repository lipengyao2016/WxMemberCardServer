/**
 * Created by Administrator on 2016/9/25.
 */
const expect = require('chai').expect;
const _ = require('lodash');
const common = require('./common');
const url = common.url;
const utils = require('../common/utils');
const request = require('common-request').request;


let wxMemberCardsTestCase =
    {
        merchantHref: 'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
        title: '温家会员卡',
        brandName: '温家店',
        servicePhone: '0755-52147841',
        //  logoUrl:'http://192.168.7.188:6500/upload/pnd/1bb87d41d15fe27b500a4bfcde01bb0e.png',
        //  backgroudUrl:'http://192.168.7.188:6500/upload/pnd/1abb2dc3d76311944ffdbe9980fbaadd.jpg',
        quatity: 5000,
        notice: "使用时向服务员出示此券",
        description: "不可与其他优惠同享",
    };


let ownerUUID = 'AppUUIDForTestCase';
let wxMemberCardsUUID = null;

let tenantUUID = null;
let tenantURL = null;

tenantURL = url /*+ '/directories' + '/zbDG5Ul3MHzHOEBFYyIalQ' + '/wxMemberCardsPackages' + '/n97eIgDCIO6wecGkvc19UQ'*/;

//wxMemberCardsUUID = 'zGVbAnrhVtP1Li75QLZ2yQ';

async function testCreateWxMemberCard() {
    let failedCnt = 0,sucedCnt = 0;
    for(let i = 99 ;i < 10000;i++)
    {
        let tempMemberCardTest = _.clone(wxMemberCardsTestCase);
        tempMemberCardTest.title = `${tempMemberCardTest.title}_${i}` ;
        tempMemberCardTest.brandName = `${tempMemberCardTest.brandName}_${i}` ;
        let {statusCode, body} = await  request.post(`${url}/wxMemberCards`, tempMemberCardTest);
        if(statusCode!= 201)
        {
            failedCnt++;
            console.error('wxMemberCards test  create  body error statusCode:' + statusCode  + 'body:' + JSON.stringify(body,null,2)
                + ',failedCnt:' + failedCnt);
        }
        else
        {
            sucedCnt++;
        }
    }
    console.log('testCreateWxMemberCard failedCnt:' + failedCnt+',sucedCnt:' + sucedCnt);
    return true;
}

testCreateWxMemberCard().then(data=>{
    console.log('testCreateWxMemberCard data..' + data);
});


