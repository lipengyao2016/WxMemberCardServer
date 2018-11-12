
#Remark
1.目前所有的测试环境请求IP都是经过网关，所以统一走网关的主机和端口，并在URL前面加上wxMemberCardServer的前缀.

资源列表：

wxMemberCard(微信会员卡)


**内部会员卡的余额和余次变动消息结构定义**
```
消费通知结构
{
      ownerCardId:'3104931836939327',   //会员卡号。
      cardType:'amount',  //卡类型，amount:储值卡，count:储次卡。
      tradeType:'consume',  //交易类型，consume:消费，recharge:充值，refund:退款。
      tradeAt:'2018-9-10 11:12:10',  //交易时间。
      tradeValue:1,   //交易值，如交易次数，交易金额。 不限次数为0次。
      leftValue:520,  //剩余值，如余额，余次。


      consumeDetails:  //消费，退款次数明细显示，充值时不显示   (备注)
      [{
         name:'按摩',
         tradeValue:2,
         leftValue:10, //0：不限次数。
      }],

      rechargeDetails:{
         rechargeTaoCanName:'',  //充值套餐名称。 (备注)
         rechargeAmount:100,    //充值金额。
         giveAmount:20,         //赠送金额。
      },
}


memberCardInfo:{
      exchangeName : 'exchange_memberCard',
      exchangeType : 'direct',
      routeKey : 'member_card_balance_change',
      queueName : 'queue_memberCard_balance',
},
```




#wxMemberCard:

wxMemberCard资源是指微信卡包中的会员卡信息。



###1.创建微信会员卡.

http://localhost:6015/api/v1.0.0/wxMemberCards

   
**http**

post

```
{
    merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',   //店铺链接，不传从JWT中获取。
    title:'杨家米粉店99会员卡',  //会员卡标题。
    brandName:'杨家米粉店99',   //会员卡公司名称。
    logoUrl:'http://192.168.7.188:6500/upload/pnd/1bb87d41d15fe27b500a4bfcde01bb0e.png',  //logourl
    backgroudUrl:'http://192.168.7.188:6500/upload/pnd/1abb2dc3d76311944ffdbe9980fbaadd.jpg', //背景图。
    quatity:5000,   //数量。
    notice: "使用时向服务员出示此券",  //卡券使用提醒，字数上限为16个汉字。
    date_info:  //使用有效日期，有效期的信息。
    {
        type:'DATE_TYPE_FIX_TIME_RANGE',  //使用时间的类型 支持固定日期有效类型(DATE_TYPE_FIX_TIME_RANGE) 永久有效类型( DATE_TYPE_PERMANENT)
        begin_timestamp:parseInt(new Date().getTime() / 1000), //type为DATE_TYPE_FIX_TIME_RANGE时专用， 表示起用时间。从1970年1月1日00:00:00至起用时间的秒数 （ 东八区时间,UTC+8，单位为秒 ）
        end_timestamp:parseInt(new Date('2019-9-30').getTime() / 1000), //type为DATE_TYPE_FIX_TERM_RANGE时专用，表示结束时间 （ 东八区时间,UTC+8，单位为秒 ）
    },
    servicePhone:'0755-52147841', //服务电话。
    "time_limit":  //使用时段限制，
    [
        {
            "type": "MONDAY",  //限制类型枚举值：支持填入 MONDAY 周一 TUESDAY 周二 WEDNESDAY 周三 THURSDAY 周四 FRIDAY 周五 SATURDAY 周六 SUNDAY 周日 此处只控制显示， 不控制实际使用逻辑，不填默认不显示
            "begin_hour":0, //当前type类型下的起始时间（小时） ，如当前结构体内填写了MONDAY， 此处填写了10，则此处表示周一 10:00可用
            "end_hour":10,  //当前type类型下的结束时间（小时） ，如当前结构体内填写了MONDAY， 此处填写了20， 则此处表示周一 10:00-20:00可用
            "begin_minute":10,//当前type类型下的起始时间（分钟） ，如当前结构体内填写了MONDAY， begin_hour填写10，此处填写了59， 则此处表示周一 10:59可用
            "end_minute":59 //当前type类型下的结束时间（分钟） ，如当前结构体内填写了MONDAY， begin_hour填写10，此处填写了59， 则此处表示周一 10:59-00:59可用
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
    description: "不可与其他优惠同享",  //使用须知
    "text_image_list":  //图文列表，显示在详情内页 ，
    [
        {
            "image_url": "http://192.168.7.188:6701/upload/pnd/41591338e24a17f4b42d1f1a75ceafdf.jpg", //图片链接
            "text": "此菜品精选食材，以独特的烹饪方法，最大程度地刺激食 客的味蕾", //图文描述
        },
    ],
    prerogative:'买单消费送积分', //会员卡特权说明,限制1024汉字。
}
```


**response**


```
{
  "href": "http://localhost:6015/api/v1.0.0/wxMemberCards/6O27YdG6M69HLs0iHfWmCA",
  "id": 812,
  "uuid": "6O27YdG6M69HLs0iHfWmCA",
  "title": "杨家米粉店aa会员卡",
  "brandName": "杨家米粉店aa",
  "servicePhone": "0755-52147841",
  "logoUrl": "http://192.168.7.188:6701/upload/mobile/f0f5fc6cedfcf8711e49ef211f23808c.jpg",
  "notice": "使用时向服务员出示此券",
  "description": "不可与其他优惠同享",
  "backgroudUrl": "http://192.168.7.188:6500/upload/pnd/1abb2dc3d76311944ffdbe9980fbaadd.jpg",
  "quatity": 5000,
  "refuseReason": null,      //微信会员卡审核拒绝原因。
  "wxAppId": "wxbdca4ea29ec28344",  //微信公众号APPID.
  "wxCardId": "pNwkp0XAkLHStjPPwMUWqm8f2plA", //微信会员卡ID.
  "wxQRCodeUrl": null, //微信二维码URL.
  "status": "created", //'uncreated':未创建，'created':已创建，'audited':已审核。rejected:已拒绝。
  "merchantUUID": "82TaIejHrZp4aHaM9hG2DQ",
  "createdAt": "2018-09-20 14:00:21",
  "modifiedAt": "2018-09-20 14:00:21",
  "merchant":
  {
    "href": "http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ"
  }
}
```


###2.创建微信会员卡的二维码

http://localhost:6015/api/v1.0.0/wxMemberCardQRCode


当不传商户者链接时，默认从JWT中获取店铺链接作为拥有者链接.
   
**http**

post

```
{
   merchantHref:'http://192.168.7.188:6005/api/v1.0.0/shops/82TaIejHrZp4aHaM9hG2DQ',
} 
```


**response**


```
{
      "wxCardId": "pNwkp0XAkLHStjPPwMUWqm8f2plA",
      "wxQRCodeUrl": "https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=gQEK8TwAAAAAAAAAAS5odHRwOi8vd2VpeGluLnFxLmNvbS9xLzAyNU5fZDAyVDljRmgxRHlINE50NEwAAgRiOKNbAwSAM_EB"
}
```



###3.通过激活TICKET获取微信用户信息

http://localhost:6015/api/v1.0.0/getWxUserInfoByActiveTicket


**http**

get

```
{
   activate_ticket:'fDZv9eMQAFfrNr3XBoqhb/jyaoEF8uXzzJAcUS5B9uWcl10eHpyfb8S73xzUeT0MYPuzzLTbN6WIrf8fDBdUmbfCPGzeAn1g67o77hlz2qQ='
}
```


**response**


```
{
  "mobile": "18922846486",
  "name": "李",
  "sex": "男",
  "birthday": "1998-5-4",
  "password": ""
}
```

###4.同步微信会员卡和内部会员卡

http://localhost:6015/api/v1.0.0/syncOwnerMember


**http**

post

```
{
   encryptCode:'e%2FZZn6tnN%2FpKhmM2f8XOXSHXEmKWdIvHdergkpCz8MI%3D',
   wxCardId:'pNwkp0U2t2deSYnFw3C1SrsVWoT0',
   openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',
   activate_ticket:'fDZv9eMQAFfrNr3XBoqhb%2FjyaoEF8uXzzJAcUS5B9uUPS9ZvBhYhiFAPa49D0ET0tbSmn%2Fg3p3xISC368idv9miFxmQbxr3oDOd7ikSgyTo%3D',
}
```


**response**


```

{
  "mobile": "18922844715",
  "name": "李生",
  "sex": "男",
  "birthday": "1994-2-4",
  "ownerMemberCardId": "6383941838524995", //内部会员卡号。
  "leftCount": 0,    //余次。
  "balance": 0,      //余额。
  "code": "577581193589" //微信会员卡号。
  "isNewMember": 0,   //是否是门店新会员，1为新会员，0为老会员。
  "shopName": "小王快餐店aa" //店铺名称。
}

```


###5.激活会员卡

http://localhost:6015/api/v1.0.0/activeWxMemberCard




**http**

post

```
{
   code:'577581193589', //微信回调的加密CODE.
   balance:20,  //余额。
   leftCount:3, //余次。
   wxCardId:'pNwkp0ZmIiM-ItLDXXKgc742hpy4', //微信会员卡ID.
   openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',   //微信用户OPENID.
   ownerMemberCardId:'wefsdgsdgsf',         //内部会员卡ID.
}
```


**response**


```
{
   "errcode":0,     //0为成功，其它为失败，目前失败的情况下会抛出异常。
   "errmsg":"ok"
}
```

###6.微信小程序通过JSCODE获取会员卡信息

http://localhost:6015/api/v1.0.0/queryWxPrgCardInfo


**注意**
有可能根据一个CODE查询到多个店铺(当一个微信用户成为多家店的微会员时)，也有可能会没有店铺(当一个微信用户还不是任何一家店铺的微会员时)。

**http**

get

```
{
    wxJSCode:'0234SALh2Qa0NI0Y9YJh2FiPLh24SALg',
}
```


**response**


```
[
  {
    "ownerCardUUID": "eHxe7kjfbP4qWv5ETHyURA",  //内部会员卡UUID。
    "shopUUID": "82TaIejHrZp4aHaM9hG2DQ",       //店铺UUID.
    "shopName": "小王快餐店ee"                   //店铺名称。
  }
]
```

###7.微信会员卡内网页跳转查询内部会员卡信息

http://localhost:6015/api/v1.0.0/findOwnerMemberByWxData


**注意**
有可能根据一个CODE查询到多个店铺(当一个微信用户成为多家店的微会员时)，也有可能会没有店铺(当一个微信用户还不是任何一家店铺的微会员时)。
微信OPENID 和内部会员卡UUID二选一即可。

**http**

get

```
{
    wxCardId:'pNwkp0fTRyHZAOexQ8_axt3Jd63c',   //微信会员卡ID.
    openId:'oNwkp0e9CLF66b-Xm_ovwIJ63krM',     //openId
    ownerCardUUID:'YmnUQkB9uRJUFxXAVRiINQ',    //内部会员卡UUID.
}
```


**response**


```

{
    "ownerCardUUID": "eHxe7kjfbP4qWv5ETHyURA",  //内部会员卡UUID.
    "ownerCardId": "6383941837958318"           //内部会员卡ID.
    "shopUUID": "82TaIejHrZp4aHaM9hG2DQ",       //店铺UUID.
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXIiOnsidXVpZCI6IlltblVRa0I5dVJKVUZ4WEFWUmlJTlEiLCJuYW1lIjpudWxsfSwic2hvcCI6eyJ1dWlkIjoiODJUYUllakhyWnA0YUhhTTloRzJEUSIsIm5hbWUiOiLmvZzmsZ_lsI_pvpnomb4xMiJ9LCJpYXQiOjE1MzkxNTM0NjMsImV4cCI6MTUzOTE2MDY2M30.XA9oLNE1vdh6I7pIfZ6vkuMPYNFRkux8Ral9-dhdQwDyrInryDmFe0lt3XMXMd2vVL_w21oXnjh396aTRrvOtwm7OkAGHZvPJZRVOxQXspewkayOMsNZvSCAQMoQ76tA48T7jro5LZyPzpzjHmggiGxr76yFgqHSQi27JUnL3DU"
}

```