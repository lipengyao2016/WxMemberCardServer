/**
 * Created by Administrator on 2018/1/15.
 */

const config = require('./config');

module.exports = {
    // 微信会员卡配置。
    "wxMemberCard":{
        rest_api: 'batch' ,

        extend_api: [
            // {name: 'create', method: 'POST', url:'/api/:version/merchants/:merchantUUID/customers'},
            // {name: 'listPackageTotalStatistics', method: 'GET', url:'/api/:version/goodsPackageTotalStatistics'},
            //{name: 'listGoodsCostStatistics', method: 'GET', url:'/api/:version/goodsCostStatistics'},

            {name: 'createWxMemberCardQRCode', method: 'POST', url:'/api/:version/wxMemberCardQRCode'},
            {name: 'setWxMemberCardTestWhiteList', method: 'POST', url:'/api/:version/wxMemberCardTestWhiteList'},

            {name: 'onRecvWxMsg', method: ['GET','POST'], url:'/api/:version/onRecvWxMsg'},

            {name: 'countWxMemberGetCardsCnt', method: 'GET', url:'/api/:version/countWxMemberGetCardsCnt'},



        ],

        params: {
            merchant:{type:'url'},
            title:{type:'string'},
            brandName:{type:'string'},

            servicePhone:{type:'string'},
            logoUrl:{type:'string'},

            notice:{type:'string'},
            description:{type:'string'},

            backgroudUrl:{type:'string'},
            quatity:{type: 'number',value:50000},

            refuseReason:{type:'string'},
            wxAppId:{type:'string'},
            wxCardId:{type:'string'},
            wxQRCodeUrl:{type:'string'},
            status:{type:'string',value:'uncreated'},

            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },


    // 微信会员卡CODE明细。
    "wxMemberCardItem": {
        rest_api:  'batch',
       // super: 'wxMemberCard',

        extend_api: [

            {name: 'updateMemberBonus', method: 'POST', url:'/api/:version/updateMemberBonus'},
            {name: 'updateMemberBalance', method: 'POST', url:'/api/:version/updateMemberBalance'},

           // {name: 'getWxUserInfoByActiveTicket', method: ['GET','POST'], url:'/api/:version/getWxUserInfoByActiveTicket'},

            {name: 'activeWxMemberCard', method: 'POST', url:'/api/:version/activeWxMemberCard'},

            {name: 'syncOwnerMember', method: 'POST', url:'/api/:version/syncOwnerMember'},

            {name: 'findOwnerMemberByWxData', method: 'GET', url:'/api/:version/findOwnerMemberByWxData'},

        ],

        params: {
            wxCardId:{type:'string'},
            unionId:{type:'string'},
            wxMemberCardCode:{type:'string'},
            wxMemberShipNo:{type:'string'},
            openId:{type:'string'},
            mobile:{type:'string'},
            name:{type:'string'},

            nickname:{type:'string'},
            sex:{type:'number'},
            birthday:{type:'time'},


            ownerCardId:{type:'string'},
            ownerCardUUID:{type:'string'},
            isActived: {type: 'number',value:0},
            status:{type:'string',value:'created'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },


    // 微信资源图片。
    "wxImage": {
        rest_api:  'batch',
        //super: 'wxMemberCard',

        extend_api: [
            /*  {name: 'openPayMode', method: 'POST', url:'/api/:version/openPayMode'},*/
            //  {name: 'listAllPayModes', method: 'GET', url:'/api/:version/listAllPayModes'},
        ],

        params: {
            orignUrl:{type:'string'},
            wxResourceUrl:{type:'string'},
            appId:{type:'string'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },

    //微信子商户信息
    "wxSubMerchant": {
        rest_api:  'batch',
        //super: 'wxMemberCard',

        extend_api: [
            /*  {name: 'openPayMode', method: 'POST', url:'/api/:version/openPayMode'},*/
            //  {name: 'listAllPayModes', method: 'GET', url:'/api/:version/listAllPayModes'},
        ],

        params: {
            merchant:{type:'url'},
            brandName:{type:'string'},
            logoUrl:{type:'string'},
            protocolUrl:{type:'string'},
            protocolMediaId:{type:'string'},
            protocolEndAt: {type:'time'},
            agreementUrl:{type:'string'},
            agreementMediaId:{type:'string'},
            operatorUrl:{type:'string'},
            operatorMediaId:{type:'string'},
            primaryCategoryId:{type:'number'},
            secondaryCategoryId:{type:'number'},

            wxAppId:{type:'string'},
            wxSubMerchantId:{type:'string'},
            wxSubAppId:{type:'string'},
            status:{type:'string',value:'created'},
            rejectReason:{type:'string'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },


    //微信第三方平台授权信息。
    "WxAuthInfo": {
        rest_api:  'batch',
        //super: 'wxMemberCard',

        extend_api: [
            /*  {name: 'openPayMode', method: 'POST', url:'/api/:version/openPayMode'},*/
            //  {name: 'listAllPayModes', method: 'GET', url:'/api/:version/listAllPayModes'},
            { name: 'onRecvAuthEvent', method: ['GET','POST'], url:'/api/:version/onRecvAuthEvent'},
            {name: 'onRecvMsgEvent', method: ['GET','POST'], url:'/api/:version/:APPID/onRecvMsgEvent'},

            { name: 'getWxAuthUrl', method: 'GET', url:'/api/:version/getWxAuthUrl'},
            { name: 'onAuthRet', method: 'GET', url:'/api/:version/onAuthRet'},

        ],

        params: {
            merchantUUID:{type:'string'},
            authAppId:{type:'string'},
            authRefreshToken:{type:'string'},
            //funcInfo:{type:'json'},
            serviceType:{type:'number'},
            nickName: {type:'string'},
            headImgUrl:{type:'string'},
            verifyType:{type:'number'},
            originId:{type:'string'},
            principalName:{type:'string'},
           // businessInfo:{type:'json'},
            qrcodeUrl:{type:'string'},
            status:{type:'string',value:'enabled'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },



    //微信开放平台账号绑定关系。
    "WxOpenAccountBind": {
        rest_api:  'batch',
        //super: 'wxMemberCard',

        extend_api: [
            /*  {name: 'openPayMode', method: 'POST', url:'/api/:version/openPayMode'},*/
            //  {name: 'listAllPayModes', method: 'GET', url:'/api/:version/listAllPayModes'},
        ],

        params: {
            openAppId:{type:'string'},
            authAppId:{type:'string'},
           // authAppType:{type:'number'},
            status:{type:'string',value:'enabled'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },


    "WxMiniPrgVersion": {
        rest_api:  'batch',
        //super: 'wxMemberCard',

        extend_api: [
            /*  {name: 'openPayMode', method: 'POST', url:'/api/:version/openPayMode'},*/
            //  {name: 'listAllPayModes', method: 'GET', url:'/api/:version/listAllPayModes'},
            {name: 'uploadCode', method: 'POST', url:'/api/:version/uploadCode'},
            {name: 'getTestQrCode', method: 'GET', url:'/api/:version/WxMiniPrg/getTestQrCode'},
            {name: 'getCategory', method: 'GET', url:'/api/:version/WxMiniPrg/getCategory'},

            {name: 'commitAudit', method: 'POST', url:'/api/:version/WxMiniPrg/commitAudit'},
            {name: 'queryAuditStatus', method: 'GET', url:'/api/:version/WxMiniPrg/queryAuditStatus'},


        ],

        params: {
            merchantUUID:{type:'string'},
            appId:{type:'string'},
            templateId:{type:'number'},
            userCodeVersion:{type:'string'},
            userCodeDesc:{type:'string'},
            customerExtJson:{type:'json'},
            auditInfo:{type:'json'},
            auditid:{type:'number'},
            status:{type:'string',value:'created'},
            createdAt: {type:'time'},
            modifiedAt:{type:'time'},
        },
    },



};