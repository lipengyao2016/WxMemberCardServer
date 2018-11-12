
var os = require('os');
var config = require('../config/config');
/**
 * 获取指定网卡的IP
 * @param name 网卡名
 * @param family IP版本 IPv4 or IPv5
 * @returns ip
 */
function getLocalIP (name, family) {

    //所有的网卡
    var ifaces = os.networkInterfaces();

    //移除loopback,没多大意义
    for (var dev in ifaces) {
        if (dev.toLowerCase().indexOf('loopback') != -1) {
            delete  ifaces[dev];
            continue;
        }
    }

    var ip = null;
    if(!family){
        family = 'IPv4';
    }
    family = family.toUpperCase();

    //var iface = null;
    if (name == null) {
        for (var dev in ifaces) {
            ifaces[dev].forEach(function (details) {
                if (details.family.toUpperCase() === family) {
                    ip = details.address;
                }
            });
            break;
        }
        return ip;
    }
    var nameList = name.split(',');
    for (var i = 0, j = nameList.length; i < j; i++) {
        var key = nameList[i];

        //指定的链接不存在
        if (ifaces[key] == null) {
            continue;
        }

        ifaces[key].forEach(function (details) {
            if (details.family.toUpperCase() === family) {
                ip = details.address;
            }
        });
        if (ip != null) {
            break;
        }
    }
    if (ip == null) {
        ip = '127.0.0.1';
        log.error("get ip error, return 127.0.0.1, please check");
    }

    return ip;
};
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
};
var ip = getLocalIP();
var port = normalizePort(config.server.port || '3001');
var dn;
if(config.server.domain){
    //dn = process.env.DOMAINNAME + ':' + port;
    dn = config.server.domain + ':' + port;
}else{
    dn = ip + ':' + port;
}
console.log("DOMAINNAME: "+dn);
exports.getDomainName = function(){
    return dn;
};

exports.getLocalIP = getLocalIP;