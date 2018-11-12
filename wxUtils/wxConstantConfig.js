const fs = require('fs');

let wxConstantConfig = {
    wxServerDomain:'api.weixin.qq.com',
    protocal:'https',
    payCmd:{
        getAccessTokenCmd:'/cgi-bin/token',
        uploadImgCmd:'/cgi-bin/media/uploadimg',
        memberCardCreateCmd:'/card/create',
        setActiveCardFormCmd:'/card/membercard/activateuserform/set',
        createMemCardQRCodeCmd:'/card/qrcode/create',
        setTestWhiteListCmd:'/card/testwhitelist/set',
        getMemberDetailsInfoCmd:'/card/membercard/userinfo/get',
        uploadMediaImgCmd:'/cgi-bin/media/upload',
        getCategoryCmd:'/card/getapplyprotocol',
        createSubMerchantCmd:'/card/submerchant/submit',
        updateMemberCardCmd:'/card/membercard/updateuser',
        queryWxUserInfoCmd:'/cgi-bin/user/info',
        sendTemplateMsgCmd:'/cgi-bin/message/template/send',
        decryCodeCmd:'/card/code/decrypt',
        getWxUserByActiveTickerCmd:'/card/membercard/activatetempinfo/get',
        activeWxMemberCmd:'/card/membercard/activate',
        getWxPrgJsSessionCmd:'/sns/jscode2session',
    },
    menuCmd:{
        queryMenuCmd:'/cgi-bin/menu/get',
    },

    thirdPlatformCmd:{
        queryComponetAccessTokenCmd:'/cgi-bin/component/api_component_token',
        createPreAuthCodeCmd:'/cgi-bin/component/api_create_preauthcode',
        queryAuthInfoByAuthCodeCmd:'/cgi-bin/component/api_query_auth',
        queryAuthDetailInfoCmd:'/cgi-bin/component/api_get_authorizer_info',
        refreshAuthAccessTokenCmd:'/cgi-bin/component/api_authorizer_token',
        createOpenAccountCmd:'/cgi-bin/open/create',
        bindOpenAccountCmd:'/cgi-bin/open/bind',
    },

    miniPrgCmd:{
        setPrgServerDomainCmd:'/wxa/modify_domain',
        setPrgBusiDomainCmd:'/wxa/setwebviewdomain',
        uploadCodeCmd:'/wxa/commit',
        getTestQRCodeCmd:'/wxa/get_qrcode',
        getCategoryCmd:'/wxa/get_category',
        commitAuditCmd:'/wxa/submit_audit',
        queryAuditStatusCmd:'/wxa/get_auditstatus',
    },

    wxResFlag:{
      succ:'SUCCESS',
      fail:'FAIL'
    },

    wxErrorCode:{

    },

    wxEvent:{
       cardPassEvent:'card_pass_check',
       cardRejectEvent:'card_not_pass_check',
       subMerchantCheckEvent:'card_merchant_check_result',
       userGotCardEvent:'user_get_card',
       userActiveCardEvent:'submit_membercard_user_info',
       userDelCardEvent:'user_del_card',
       authSucedEvent:'authSuced',
    },



};

module.exports = wxConstantConfig;