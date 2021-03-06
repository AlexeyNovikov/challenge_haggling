'use strict'; /*jslint node:true*/
const fs = require('fs');

function clone(obj){
    if (Array.isArray(obj))
        return obj.map(clone);
    if (!obj || typeof obj!='object')
        return obj;
    let res = {};
    for (let key in obj)
        res[key] = clone(obj[key]);
    return res;
}

class Logger {
    log(type, ...arg){ this[`log_${type}`](...arg); }
    finalize(){}
}

class MultiLogger extends Logger {
    constructor(loggers){
        super();
        this.loggers = loggers;
    }
    log(type, ...arg){
        for (let logger of this.loggers)
            logger.log(type, ...arg);
    }
    finalize(){
        for (let logger of this.loggers)
            logger.finalize();
    }
}

class FileLogger extends Logger {
    constructor(filename){
        super();
        this.filename = filename;
        this.data = [];
    }
    log(type, ...arg){
        if (type!='network')
            this.data.push([type, ...arg.map(clone)]);
    }
    finalize(){
        fs.writeFileSync(this.filename,
            JSON.stringify(this.data, null, 4)+'\n', 'utf8');
    }
}

function replay(filename, logger){
    let data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    for (let [type, ...arg] of data)
        logger.log(type, ...arg);
    logger.finalize();
}

module.exports = {Logger, MultiLogger, FileLogger, replay};
