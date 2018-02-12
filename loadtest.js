var request = require("request");
var rp = require('request-promise');
var sleep = require("sleep");
var dateFormat = require('dateformat');
var distributions = require('probdist');

const MSG_SIZE = [
  [7, 128],
  [23, 512],
  [44, 1024]
];
const ENDPOINT = ["send_all","send_idp"];

async function PostRequest(destination,endpoint,seq,message){
    var options = {
        method: 'POST',
        uri: destination+"/"+endpoint+"/"+seq,
        body: {
            payload: message
        },
        json: true // Automatically stringifies the body to JSON
    };
 
    await rp(options)
    .then( function (parsedBody) {
        // POST succeeded...
    })
    .catch( function (err) {
        // POST failed...
    });
}
async function callRequest(duration,mode,startSeq){
  const startTime = Date.now();
  var messageCounter = startSeq;
  if(mode == 0){
    const durationInMilliseconds = duration * 1000;
    while (Date.now() - startTime < durationInMilliseconds) {
      const rand_size = Math.floor(Math.random() * 3); //random 0 =128 byte , 1 = 512 byte , 2 = 1024 byte
      const msg_date = dateFormat(new Date().toISOString(), "yymmddhhmmss.l");
      const msg = (new Array(MSG_SIZE[rand_size][0]).join( msg_date )).slice(0,MSG_SIZE[rand_size][1]);
      const endpointType = Math.floor(Math.random() * 2); 
    
      await PostRequest("http://localhost:3000",ENDPOINT[endpointType],messageCounter,msg);
      await messageCounter++;
    }
    console.log(messageCounter);
  }
  else if(mode > 0){
    const durationInMilliseconds = duration * 1000;
    const sleeptime =  1000000/mode ;

    while (Date.now() - startTime < durationInMilliseconds) {
      const rand_size = Math.floor(Math.random() * 3); //random 0 =128 byte , 1 = 512 byte , 2 = 1024 byte
      const msg_date = dateFormat(new Date().toISOString(), "yymmddhhmmss.l");
      const msg = (new Array(MSG_SIZE[rand_size][0]).join( msg_date )).slice(0,MSG_SIZE[rand_size][1]);
      const endpointType = Math.floor(Math.random() * 2); 
    
      await PostRequest("http://localhost:3000",ENDPOINT[endpointType],messageCounter,msg);
      await messageCounter++;
      await sleep.usleep(sleeptime);
    }
    console.log(messageCounter);
  }
  else if(mode < 0){
    const tps = mode * -1;
    const durationInMilliseconds = duration * 1000;
    const sleeptime =  1000000/tps ;
    var poisson_init = distributions.poisson(sleeptime);
    const poisson_sleep = poisson_init.sample(tps*duration);
    while (Date.now() - startTime < durationInMilliseconds) {
      const rand_size = Math.floor(Math.random() * 3); //random 0 =128 byte , 1 = 512 byte , 2 = 1024 byte
      const msg_date = dateFormat(new Date().toISOString(), "yymmddhhmmss.l");
      const msg = (new Array(MSG_SIZE[rand_size][0]).join( msg_date )).slice(0,MSG_SIZE[rand_size][1]);
      const endpointType = Math.floor(Math.random() * 2); 
    
      await PostRequest("http://localhost:3000",ENDPOINT[endpointType],messageCounter,msg);
      await sleep.usleep(poisson_sleep[messageCounter]);
     // await console.log(poisson_sleep[messageCounter]);
      await messageCounter++;
    }
    console.log(messageCounter);
  }
}
callRequest(5,-100,0);



