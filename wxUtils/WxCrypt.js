'use strict'
/**
 * WxCrypt 微信消息加解密的方法
 * @return new WxCrypt(wxConfig)
 * 返回一个单例即可，不需要重复引用
 */
const crypto = require('crypto');
const config = require('../config/config');
const wxConfig = {
// 传入配置信息
    token: config.wxThridPlatformInfo.msgToken,
    appid: config.wxThridPlatformInfo.appId,
    encodingAESKey: config.wxThridPlatformInfo.msgKey
}

class WxCrypt {
    constructor(opts) {
        //初始化需要用到的属性
        this.token = opts.token;
        this.appid = opts.appid;
        this.aesKey = new Buffer(opts.encodingAESKey + '=', 'base64');
        this.IV = this.aesKey.slice(0, 16)
    }

    encrypt(xmlMsg) {
        /*
         *@params String xmlMsg 格式化后的 xml 字符串
         *@return String 加密后的字符串 填入到 Encrypt 节点中
         * 参照官方文档 需要返回一个buf: 随机16字节 + xmlMsg.length(4字节）+xmlMsg+appid。
         * buf的字节长度需要填充到 32的整数，填充长度为 32-buf.length%32, 每一个字节为 32-buf.length%32
         */
        let random16 = crypto.pseudoRandomBytes(16);
        let msg = new Buffer(xmlMsg);
        let msgLength = new Buffer(4);
        msgLength.writeUInt32BE(msg.length, 0);

        let corpId = new Buffer(this.appid);

        let raw_msg = Buffer.concat([random16, msgLength, msg, corpId]);
        let cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.IV);
        cipher.setAutoPadding(false);//重要，autopadding填充的内容无法正常解密
        raw_msg = this.PKCS7Encode(raw_msg);

        let cipheredMsg = Buffer.concat([cipher.update(/*encoded*/raw_msg), cipher.final()]);

        return cipheredMsg.toString('base64');
    }

    decrypt(text) {
        /*
         *@params String text 需要解密的字段（Encrypt节点中的内容）
         * @return String msg_content 返回消息内容（xml字符串）
         */

        let plain_text;
        let decipher = crypto.Decipheriv('aes-256-cbc', this.aesKey, this.IV);
        // crypto.Decipheriv == crypto.createDecipheriv 两个方法是一样的
        decipher.setAutoPadding(false);//重要

        let decipheredBuff = Buffer.concat([decipher.update(text, 'base64'), decipher.final()]);
        decipheredBuff = this.PKCS7Decode(decipheredBuff);


        let len_netOrder_corpid = decipheredBuff.slice(16);
        //切割掉16个随机字符，剩余为 (4字节的 msg_len) + msg_content(长度为 msg_len ) + msg_appId
        let msg_len = len_netOrder_corpid.slice(0, 4).readUInt32BE(0);
        let msg_content = len_netOrder_corpid.slice(4, msg_len + 4).toString('utf-8');
        let msg_appId =len_netOrder_corpid.slice(msg_len+4).toString('utf-8');

        return msg_content;
    }

    PKCS7Decode(buff) {
        /*
         *去除尾部自动填充的内容
         */
        let padContent = buff[buff.length - 1];
        if (padContent < 1 || padContent > 32) {
            padContent = 0;
        }
        let padLen = padContent;//根据填充规则，填充长度 = 填充内容，这一步赋值可以省略
        return buff.slice(0, buff.length - padLen);
    }

    PKCS7Encode(buff) {
        let blockSize = 32;
        let needPadLen = 32 - buff.length % 32;
        if (needPadLen == 0) {
            needPadLen = blockSize;
        }
        let pad = new Buffer(needPadLen);
        pad.fill(needPadLen);
        let newBuff = Buffer.concat([buff, pad]);
        return newBuff;
    }
}

var wxCrypt = new WxCrypt(wxConfig);
module.exports = wxCrypt;


/*
let encrptyData ='ayi5Tyk/IsvbaYSBvF6wY9+4M+pOllXp/m28JNEp5AIiiJ5rLlRL/2EIrTxdypUrPOVZK5v1aPhzBtr269oDSIPfFKCZQovgvkqen+6bsrBdApuhGRgWotL623VazjXgoqrcarSC4NfwKLTNPyl2/+U+cD0w+0wEbED7HC5U47KJgt3x29vDwqQA+hmhdCEmSwW947NXIaCM5kdqPtAfVilFYdefhD8XfOFjObOXDc1MIIywDH7OO1SvD8MivQ6eiQvEy4L1JavXGJX6bSxXpWQDnix6f0bpatQk2co5WMe3qdGirhsPzo7vYLL3k3B5cYmDl6uQk6JS0kPQ2zsePBIC8p2w/a5WQPlW3I2l5rB+sXiiarauEZ8Dz6P/rlkFmUHzpFuA/NlC1dUiR5WN7GYmmhQsRbpK9RHXseKNfBTlwPjRAPCO44SZoBoEFXI7k4du3JU2+8Zvv0UhdQOw4Q==';
console.log(wxCrypt.decrypt(encrptyData));*/
