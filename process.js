var lazy = require('lazy');
var fs = require('fs');
var _ = require('lodash');
var url = require('url');
var querystring = require('querystring');

var lines = [];

new lazy(fs.createReadStream('./ivle_requests.log'))
  .lines
  .map(function(line){
    return JSON.parse(line.toString());
  })
  .join(function(lines){
    // Log Request Date when requestTime > 60s
    // _.each(lines, function(line){
    //   if(line.requestTime > 60000) console.log(line.date);
    // });


    // Sort by Path, Duration
    var groups = _.groupBy(lines, function(line){
      var urlOptions = url.parse(line.url);
      var queryOptions = querystring.parse(urlOptions.query);

      var groupKey = urlOptions.pathname;
      if(queryOptions.Duration)
        groupKey += ', duration=' + queryOptions.Duration;

      if(queryOptions.CourseID)
        groupKey += ', courseId=' + queryOptions.CourseID;

      return groupKey;
    });


    _.each(groups, function(value, key){
      console.log(key);

      var bodies = _.chain(value).pluck('body').reduce(function(result, val){
        val = JSON.parse(val);

        var compare = (_.last(result) || {}).Results;

        if(!_.isEqual(val.Results, compare)) result.push(val);

        return result;
      }, []).value();


      var bodySizes = _.map(value, function(val){
        return val.body.length;
      });


      var requestTimes = _.pluck(value, 'requestTime');

      // Output each unique response
      // _.each(bodies, function(val){
      //   console.dir(val, {depth: null, colors:true});
      // });


      console.log('Uniques:', bodies.length);
      console.log('Requests:', value.length);
      console.log('Response Sizes Quartiles:', getPercentiles(bodySizes));
      console.log('Response Sizes Min Max:', getMinMax(bodySizes));
      console.log('Response Times Quartiles:', getPercentiles(requestTimes));
      console.log('Response Times Min Max:', getMinMax(requestTimes));
    });
  })

function getPercentiles(array){
  var arr = _.clone(array).sort(function(a, b){return a-b});

  var first = Math.round(arr.length/4);
  var half = Math.round(arr.length/2);
  var third = Math.round(arr.length/4 * 3);

  return [arr[first], arr[half], arr[third]];
}

function getMinMax(array){
  var arr = _.clone(array).sort(function(a, b){return a-b});

  return [_.first(arr), _.last(arr)];
}

