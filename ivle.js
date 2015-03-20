var util = require('util');
var Promise = require('bluebird');
var request = require('request');
var url = require('url');
var _ = require('lodash');

var config = require('./config');

var options = {
  protocol: 'https',
  hostname: 'ivle.nus.edu.sg'
};

var validLogin = function(token){
  return new Promise(function(resolve, reject) {
    request(profileUrl(token), function(error, response, body){
      if(error) return reject(error);

      // Check API Response for {Comments: Valid login!}
      var jsonBody = JSON.parse(body);
      if(jsonBody.Comments == 'Valid login!'){
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

var loginUrl = function(){
  var urlOptions = _.extend({
    pathname: '/api/login',
    query: {
      apikey: config.apikey,
      url: 'http://127.0.0.1:1337/callback'
    }
  }, options);

  return url.format(urlOptions);
};

function profileUrl(token){
  var urlOptions = _.extend({
    pathname: '/api/Lapi.svc/Profile_View',
    query: {
      APIKey: config.apikey,
      AuthToken: token
    }
  }, options);

  return url.format(urlOptions);
}

function modulesUrl(token){
  var urlOptions = _.extend({
    pathname: '/api/Lapi.svc/Modules_Student',
    query: {
      APIKey: config.apikey,
      AuthToken: token,
      Duration: 0,
      IncludeAllInfo: false
    }
  }, options);

  return url.format(urlOptions);
}

function workbinsUrl(token, courseId, queryOverrides){
  var urlOptions = _.extend({
    pathname: '/api/Lapi.svc/Workbins',
    query: {
      APIKey: config.apikey,
      AuthToken: token,
      CourseID: courseId,
      Duration: 0
    }
  }, options);

  _.assign(urlOptions.query, queryOverrides || {});

  return url.format(urlOptions);
}

function downloadUrl(token, fileId){
  var urlOptions = _.extend({
    pathname: '/api/downloadfile.ashx',
    query: {
      APIKey: config.apikey,
      AuthToken: token,
      ID: fileId,
      target: 'workbin'
    }
  }, options);

  return url.format(urlOptions);
}

function downloadFile(token, fileId, path){
  var request = require('request');
  var fs = require('fs');

  request
    .get(downloadUrl(token, fileId))
    .on('error', function(err) {
      console.log(err);
    })
    .pipe(fs.createWriteStream(path));
}

module.exports = {
  validLogin: validLogin,
  loginUrl: loginUrl,
  profileUrl: profileUrl,
  modulesUrl: modulesUrl,
  workbinsUrl: workbinsUrl,
  downloadUrl: downloadUrl,
  downloadFile: downloadFile
};
