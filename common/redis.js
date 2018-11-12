/**
 * Copyright(C),
 * FileName:  redis.js
 * Author: sxt
 * Version: 1.0.0
 * Date: 2016/3/30  10:27
 * Description:
 */

"use strict";
var config = require('../config/config');
var Redis = require('ioredis');

var client = new Redis({
    host : config.redis.host,
    port : config.redis.port,
    db : config.redis.db,
    password : config.redis.password
});

client.on('error', function(err) {
    console.log(err);
});

module.exports = client;


/*client.lpush('list1','foo','hello','world').then(data=>{
    console.log(`v1 data:${data}`);
})*/

/*
let i = 0;
setInterval(function () {
    client.publish('mechat','world' + i).then(data=>{
        console.log(`v1 data:${data}`);
    }) ;
    i++;
},1000);
*/
