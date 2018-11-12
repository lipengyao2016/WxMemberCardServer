const moment = require('moment');
const _ = require('lodash');

// UUID操作工具集
exports.createTranctionNo = (firstType)=>{
    let dateTimestamp = new Date().getTime() + '';
    console.log('dateTime:' + dateTimestamp);

    let rand = _.pad(_.random(0,999),3,'0');
    console.log('rand:'+rand);

    let dateStr =  dateTimestamp.substring(1)+rand;

    return firstType + dateStr;
};
