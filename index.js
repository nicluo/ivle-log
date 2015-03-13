var _ = require('lodash');
var Promise = require('bluebird');

var config = require('./config');

function startLogging(token){
}

if(!module.parent){
  var apikey = config.apikey;
  if(apikey == '21characterlongapikey'){
    console.log('Visit https://ivle.nus.edu.sg/LAPI/default.aspx to get your IVLE Api Key, then modify config.json, then run this again.');
    process.exit(1);
  }

  var token = config.token;
  if(token){
    startLogging(token);
  } else {
    console.log('No Valid Token Detected');
    var server = require('./server');
    server.singleLoginServer().then(startLogging);
  }
}
