var _ = require('lodash');
var request = require('request');
var Promise = require('bluebird');


var config = require('./config');
var ivle = require('./ivle');

var _request = function _request(url, callback){
  request(url, function(error, response, body) {
    var results = body;
    callback(error, results);
  });
};



var _logProfile = function(token){
  _request(ivle.profileUrl(token), function(err, body) {
    console.log(err);
    console.log(body);
  });
};

var _logModules = function(token){
  _request(ivle.modulesUrl(token), function(err, body) {
    console.log(err);
    console.log(body);
  });
};

var _logWorkbin = function(token){
    _request(ivle.modulesUrl(token), function(err, body) {
      var modules = body.match(/"ID":"[^"]*"/gi);
      modules = _.map(modules, function(moduleString) {
        var modStringMatch = moduleString.match(/"ID":"([^"]*)"/i);
        return modStringMatch[1];
      });
      console.log(modules);
  });
};


function startLogging(token){
//  _logProfile(token);
//  _logModules(token);
  _logWorkbin(token);
  // console.log(ivle.modulesUrl(token));
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

// camelCase keys returned from IVLE Api
var _camelCaseDeep = function _camelCaseDeep(body) {
  if (_.isArray(body))
    return _camelCaseArray(body);
  else if (_.isPlainObject(body))
    return _camelCaseObject(body);
  else
    return body;
};

var _camelCaseObject = function _camelCaseObject(obj){
  return _(obj).pairs().map(function(pair){
    var value = pair[1];
    return [_.camelCase(pair[0]), _camelCaseDeep(value)];
  }).object().value();
};

var _camelCaseArray = function _camelCaseArray(arr) {
  return _(arr).map(function(value) {
    return _camelCaseDeep(value);
  }).value();
};

