const dgram = require('dgram') //udp packets management library
const winston = require('winston') //log management library
const cron = require('node-cron') //time library
const figlet = require('figlet')
const fs = require('fs')
const path = require('path')
const { format, subDays } = require('date-fns');

//old logs deleting manager
const logFilePath = path.join(__dirname, 'syslog.log');

function removeOldLogs() {
    // Calcola la data di 30 giorni fa
    const date30DaysAgo = subDays(new Date(), 30);
    const formattedDate = format(date30DaysAgo, 'MM dd'); // Formatta la data come YYYY-MM-DD
  
    // Leggi il contenuto del file di log
    fs.readFile(logFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Errore nella lettura del file di log:', err);
        return;
      }
  
      // Dividi il contenuto del file in righe
      const lines = data.split('\n');
      
      // Filtra tutte le righe che NON appartengono alla data di 30 giorni fa
      const filteredLines = lines.filter(line => !line.includes(formattedDate));
  
      // Riscrivi il file di log con le righe filtrate
      fs.writeFile(logFilePath, filteredLines.join('\n'), (err) => {
        if (err) {
          console.error('Errore nella scrittura del file di log:', err);
        } else {
          console.log(`Cancellati i log per il giorno ${formattedDate}.`);
        }
      });
    });
  }


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
    console.log('Esecuzione della cancellazione dei log...');
    removeOldLogs();
  });