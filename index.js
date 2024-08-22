const dgram = require('dgram') //udp packets management library
const winston = require('winston') //log management library
const cron = require('node-cron') //time library
const figlet = require('figlet')

figlet('TW2', function(err, data) {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });

//configuring logging
const logger = winston.createLogger({
    transports: [
        new winston.transports.File({ filename: 'syslog.log'})
    ]
});

//creating udp server
const server = dgram.createSocket('udp4');
//Manage received messages
server.on('message', (msg,rinfo)=>{
    const logMessage = `Received log from ${rinfo.address}:${rinfo.port} - ${msg}`;
    logger.info(logMessage);
    console.log(logMessage);
});

//server error manager
server.on('error', (err) => {
    console.error(`Server error:\n${err.stack}`);
    server.close();
});

server.bind(514, () => {
    console.log('Syslog server is listening on port 514...')
});
//
cron.schedule('1 0 * * *', () => {
    const currentDate = new Date().toISOString().slice(0, 10); // Ottieni la data in formato YYYY-MM-DD
    logger.info(`--- Log Date: ${currentDate} ---`);
    console.log(`--- Log Date: ${currentDate} ---`);
  });