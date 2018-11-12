


const log4js = require('log4js');
const fs = require("fs");
const path = require("path");
const logConfig = {
    name : 'log4js_err.log',
    levels : {
        'log4js_err.log': 'ALL',
        "console":"ALL",
    },
    httpLogLevel : 'INFO'
};



// 加载配置文件
const objConfig = {
    "appenders": [
        {"type": "console", "category": "console"},
        {"type": "file", "filename": path.join(path.dirname(__dirname), logConfig.name), "category": logConfig.name}
    ],
    "replaceConsole": true,
    "levels": logConfig.levels
};

// 检查配置文件所需的目录是否存在，不存在时创建
checkAndCreateDir(path.dirname(objConfig.appenders[1]["filename"]));

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure(objConfig);

exports.getLogger = function getLogger() {
    var log = log4js.getLogger(logConfig.name);
    return log;
};



// 配合express用的方法
exports.use = function(app) {
    //页面请求日志, level用auto时,默认级别是WARN
    //var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time ms - :res[content-length]';
    var HTTP_LOG_FORMAT_DEV = ':method :url :status :response-time(ms)';
    app.use(log4js.connectLogger(log4js.getLogger(logConfig.name), {level:logConfig.httpLogLevel, format:HTTP_LOG_FORMAT_DEV}));
}

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir){
    if(fs.existsSync(dir)){
        return true;
    }else{
        if(checkAndCreateDir(path.dirname(dir))){
            fs.mkdirSync(dir);
            return true;
        }
    }
}
