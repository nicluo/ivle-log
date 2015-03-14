var _ = require('lodash');
var request = require('request');
var Promise = require('bluebird');
var schedule = require('node-schedule');

var config = require('./config');
var ivle = require('./ivle');
var logger = require('./logger');

var _request = function(url, callback){
  // Request time apparently does not work
  var startTime = new Date().getTime();

  request(url, {time: true}, function(error, response, body) {
    response.elapsedTime = (new Date().getTime() - startTime) || 0;

    callback(error, response, body);
  });
};

var _createLog = function(url, err, response, body) {
  var logObj = {
    statusCode: response.statusCode,
    requestTime: response.elapsedTime,
    body: body,
    date: new Date(),
    url: url,
    error: err
  };

  logger.info(JSON.stringify(logObj));
};


var _logProfile = function(token){
  var url = ivle.profileUrl(token);
  _request(url, function(err, response, body) {
    _createLog(url, err, response, body);
  });
};

var _logModules = function(token){
    var url = ivle.modulesUrl(token);
  _request(url, function(err, response, body) {
    _createLog(url, err, response, body);
  });
};

var _logWorkbins = function(token){

  _request(ivle.modulesUrl(token), function(err, response, body) {
    var courseIdStrings = body.match(/"ID":"[^"]*"/gi);
    courseIds = _.map(courseIdStrings, function(courseIdString) {
      var courseIdStringMatch = courseIdString.match(/"ID":"([^"]*)"/i);
      return courseIdStringMatch[1];
    });

    // Print workbin logs for each course
    _.each(courseIds, function(courseId) {
      var url = ivle.workbinsUrl(token, courseId);

      _request(url, function(err, response, body) {
        _createLog(url, err, response, body);
      });
    });
  });
};

var _logAll = function(token){
    _logProfile(token);
    _logModules(token);
    _logWorkbins(token);
};

var startLogging = function(token){
  _logAll(token);

  var rule = new schedule.RecurrenceRule();

  var j = schedule.scheduleJob(rule, function(){
    _logAll(token);
  });
};

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

