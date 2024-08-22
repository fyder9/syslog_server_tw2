const dgram = require('dgram') //udp packets management library
const winston = require('winston') //log management library

//configuring logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'syslog.log'})
    ]
});
//creating udp server
