var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
  new (winston.transports.Console)({
    formatter: function(options) {
        return options.message;
      }
    }),
  new (winston.transports.File)({
    filename: 'ivle_requests.log',
    formatter: function(options) {
        return options.message;
      }
    })
  ]
});

module.exports = logger;
