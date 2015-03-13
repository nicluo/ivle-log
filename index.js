var _ = require('lodash');
var Promise = require('bluebird');

var config = require('./config');

function startLogging(token){
}

if(!module.parent){
  var token = config.token;

  if(token){
    startLogging(token);
  } else {
    console.log('No Valid Token Detected');
    var server = require('./server');
    server.singleLoginServer().then(startLogging);
  }
}
