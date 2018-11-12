/**
 * Created by Administrator on 2018/3/2.
 */

const log4js = require('log4js');
const  package = require('./package');
const moment = require('moment');
const  config = require('./config/config');

const logConfig = {
    type: 'console',
    level: 'trace',
    filename: './logs/out.log'
};

log4js.configure({
    appenders: {
        console: { type: 'stdout'
            , /*layout: {
                type: 'pattern',
                pattern: `[%X{serverName}][%d{yyyy-MM-dd hh:mm:ss.SSS}][%p][%h] %m%n`
            }*/
            },
       /*  file: { type: 'file', filename: logConfig.filename, maxLogSize: 50*1024*1024, backups: 5
         ,
             layout: {
                 type: 'pattern',
                 pattern: `[%X{serverName}][%d{yyyy-MM-dd hh:mm:ss.SSS}][%p][%h] %m%n`,
             }
             },*/
         mq: {
             type: '@log4js-node/rabbitmq',
             host : '192.168.7.210',
             port : 5672,
            username: 'admin',
            password: 'admin',
            routing_key: 'logstash',
            exchange: 'exchange_logstash',
            mq_type: 'direct',
            durable: true,

             layout: {
                 type: 'pattern',
                 pattern: `[%X{serverName}][%d{yyyy-MM-dd hh:mm:ss.SSS}][%p][%h] %m%n`,
             }
        }
    },
    categories: {
        default: { appenders: [ 'console',/*'file',*/'mq' ], level: 'info' },
       //  file: { appenders: [ 'file' ], level: 'info' },
       // mq: { appenders: [ 'file' ], level: 'info' }
    }
});

const logger = log4js.getLogger(logConfig.type);
logger.level = 'info';
logger.addContext('serverName', package.name);

const logger1 = log4js.getLogger('mq');
logger1.addContext('serverName', package.name);

let curLogger  = config.isOpenMQLogger ? logger1 : logger;

/*const logger2 = log4js.getLogger('file');
logger2.addContext('serverName', 'file,'+package.name);*/

const methods = ['trace','debug','warn','error'];
methods.forEach(method=>
{
    console[method] = curLogger[method].bind(curLogger);
});
console.log = curLogger.info.bind(curLogger);




/*console.log = function (...arg){
    // logger.info.bind(logger);
    let curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss.SSS');
    logger.info(`[${package.name}]-[${curTime}]`,...arg);
    //logger1.info(arg);
}*/
console.log('log4j init ok..');
curLogger.info('log4j init ok..');
module.exports = curLogger;


// methods.forEach(method=>{
//     console[method](`log --> ${method}`)
// });



