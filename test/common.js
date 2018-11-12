
//var fs = require('fs');
const config = require('../config/config');


let options = {
    host: config.server.domain,
    port: config.server.port,
    path: '/',
    //key: fs.readFileSync(__dirname+'/clientSSLkey/client-key.pem'),
    //cert: fs.readFileSync(__dirname+'/clientSSLkey/client-cert.pem'),
    rejectUnauthorized:false,
    headers: {
        'Content-Type': 'application/json;charset=UTF-8',
    }
};
exports.url = `http://${options.host}:${options.port}/api/v1`;


const devUtils = require('develop-utils');
let applicationHref = 'http://localhost:5000/api/v1.0.0/applications/BQZNqVpEbFxyZ7ayW7x2yA';

/*let data = devUtils.getLastResourceUUIDInURL(applicationHref);
console.log(data);*/


let reg = /\/[\w]+\/.*$/;
let result = reg.exec(applicationHref);
console.log(result[0]);
