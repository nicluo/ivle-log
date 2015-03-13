var url = require('url');
var http = require('http');
var Promise = require('bluebird');

var ivle = require('./ivle');

var singleLoginServer = function(){
  return new Promise(function(resolve){
    var server = http.createServer(function (req, res) {
      // Parse url for querystring
      var url = require('url').parse(req.url);

      if(url.pathname == '/callback'){
        // Login callback url
        var token = require('querystring').parse(url.query).token;

        ivle.validLogin(token).then(function(valid){
          if(valid){
            console.log('Valid Token');
            console.log(token);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Success. \n');

            console.log('Closing Server');
            req.connection.destroy();
            server.close();

            // Return the promised token!
            resolve(token);
          } else {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Failure. \n');
          }
        });
      }

      else if(url.pathname == '/login'){
        // Redirect to Login
        res.writeHead(301, {Location: ivle.loginUrl()});
        res.end();
      }

      else {
        // Nudge
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('Not sure what you want to do. Go to <a href="/login">/Login?</a>\n');
      }
    }).listen(1337, '127.0.0.1');

    console.log('Start the login at http://127.0.0.1:1337/login');
    console.log('Or go straight to %s', ivle.loginUrl());
  });
};

module.exports =  {
  singleLoginServer: singleLoginServer
};
