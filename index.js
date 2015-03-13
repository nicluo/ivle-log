var request = require('request');
var _ = require('lodash');
var config = require('./config');

var login_url = 'https://ivle.nus.edu.sg/api/login/?apikey=' + config.apikey  + '&url=http://localhost/';

if(!module.parent){
  console.log('Go to \n%s\nto obtain your Auth Token', login_url);
}
