// Generated by CoffeeScript 1.7.1
"use strict";
var ECT, appRoute, async, ectRender, express, gQueue, gRunning, getservice, lastRuns, moment, rdb, redis, redisMerge, redisPull, sortKeysByOb;

express = require("express");

getservice = express.Router();

ECT = require("ect");

redis = require("redis");

async = require("async");

moment = require("moment");

appRoute = __dirname.replace('/routes', '/');

ectRender = ECT({
  root: appRoute + '/views/ect'
});

rdb = redis.createClient(6379, 'gingersnap.outpost.travel');

rdb.select(15);

lastRuns = {};

gQueue = [];

gRunning = [];

sortKeysByOb = function(myObj) {
  var i, keys, newOb;
  keys = Object.keys(myObj);
  keys.sort();
  newOb = {};
  i = 0;
  while (i < keys.length) {
    newOb[keys[i]] = myObj[keys[i]];
    i++;
  }
  return newOb;
};

redisPull = function(req, res) {
  var gQueueFunc, gRunningFunc, lastRunsFunc;
  return async.parallel([
    lastRunsFunc = function(cb1) {
      return rdb.keys('gs_lastrun_*', function(err, result) {
        return async.each(result, function(item, acb1) {
          return rdb.get(item, function(err, v) {
            var t;
            item = item.replace('gs_lastrun_', '');
            lastRuns[item] = {
              inQueue: false,
              running: false,
              lastCheck: 'Never',
              count: 'N/A',
              successRun: 'N/A',
              errorMessage: 'No error message found in Redis'
            };
            if (v === null || v === 'never') {
              lastRuns[item]['d'] = 'Never';
            } else {
              t = moment.unix(parseInt(v));
              t = t.format("MMMM Do YYYY, h:mm a");
              lastRuns[item]['d'] = t;
            }
            return acb1(null);
          });
        }, function(err) {
          return cb1(null);
        });
      });
    }, gQueueFunc = function(cb2) {
      rdb.lrange('gs_queue', 0, -1, function(err, result) {
        if (result === null || result === (void 0) || result === 'null' || result === 'undefined') {
          return gQueue = [];
        } else {
          return gQueue = result;
        }
      });
      return cb2(null);
    }, gRunningFunc = function(cb3) {
      return rdb.lrange('gs_running', 0, -1, function(err, result) {
        if (result === null || result === (void 0) || result === 'null' || result === 'undefined') {
          gRunning = [];
        } else {
          gRunning = result;
        }
        return cb3(null);
      });
    }
  ], function(err, results) {
    return redisMerge(req, res);
  });
};

redisMerge = function(req, res) {
  var errorMessage, lastChecks, mergeQueue, mergeRunning, providerCounts, successRun;
  return async.parallel([
    mergeQueue = function(cb1) {
      return async.each(gQueue, function(item, acb1) {
        lastRuns[item]['inQueue'] = true;
        return acb1(null);
      }, function(err) {
        return cb1(null);
      });
    }, mergeRunning = function(cb2) {
      return async.each(gRunning, function(item, acb2) {
        lastRuns[item]['running'] = true;
        return acb2(null);
      }, function(err) {
        return cb2(null);
      });
    }, lastChecks = function(cb3) {
      return async.each(Object.keys(lastRuns), function(item, acb3) {
        return rdb.get("gs_lastcheck_" + item, function(err, v) {
          var t;
          if (v === null || v === (void 0) || v === 'null' || v === 'undefined') {

          } else {
            t = moment.unix(parseInt(v));
            t = t.format("MMMM Do YYYY, h:mm a");
            lastRuns[item]['lastCheck'] = t;
          }
          return acb3(null);
        });
      }, function(err) {
        return cb3(null);
      });
    }, providerCounts = function(cb4) {
      return async.each(Object.keys(lastRuns), function(item, acb4) {
        return rdb.get("gs_count_" + item, function(err, v) {
          if (v === null || v === (void 0) || v === 'null' || v === 'undefined') {

          } else {
            lastRuns[item]['count'] = v;
          }
          return acb4(null);
        });
      }, function(err) {
        return cb4(null);
      });
    }, successRun = function(cb5) {
      return async.each(Object.keys(lastRuns), function(item, acb5) {
        return rdb.get("gs_success_" + item, function(err, v) {
          if (v === null || v === (void 0) || v === 'null' || v === 'undefined') {

          } else {
            lastRuns[item]['successRun'] = v;
          }
          return acb5(null);
        });
      }, function(err) {
        return cb5(null);
      });
    }, errorMessage = function(cb6) {
      return async.each(Object.keys(lastRuns), function(item, acb6) {
        return rdb.get("gs_error_" + item, function(err, v) {
          if (v === null || v === (void 0) || v === 'null' || v === 'undefined') {

          } else {
            lastRuns[item]['errorMessage'] = v;
          }
          return acb6(null);
        });
      }, function(err) {
        return cb6(null);
      });
    }
  ], function(err, results) {
    console.log(sortKeysByOb(lastRuns));
    return rdb.get("gs_count_total", function(err, v) {
      var renderHTML;
      renderHTML = ectRender.render('get_service.ect', {
        providers: sortKeysByOb(lastRuns),
        totalCount: v
      });
      return res.render('html', {
        html: renderHTML,
        page: {
          current: 'Get Service',
          icon: 'fa-list'
        },
        user: req.user
      });
    });
  });
};

getservice.get("/", function(req, res) {
  return redisPull(req, res);
});

module.exports = getservice;
