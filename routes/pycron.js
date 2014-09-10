// Generated by CoffeeScript 1.7.1
"use strict";
var ECT, appRoute, async, ectRender, express, fillKeys, lastRuns, moment, pycron, rdb, redis, redisPull, renderMe, sortKeysByOb;

express = require("express");

pycron = express.Router();

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
  return rdb.keys('pc_lastrun_*', function(err, result) {
    return async.each(result, function(item, acb1) {
      return rdb.get(item, function(err, v) {
        var t;
        item = item.replace('pc_lastrun_', '');
        t = moment.unix(parseInt(v));
        t = t.format("MMMM Do YYYY, h:mm a");
        lastRuns[item] = {
          runTime: t,
          success: 'True'
        };
        return acb1(null);
      });
    }, function(err) {
      return fillKeys(req, res);
    });
  });
};

fillKeys = function(req, res) {
  var success;
  return async.parallel([
    success = function(cb1) {
      return async.each(Object.keys(lastRuns), function(item, acb1) {
        return rdb.get("pc_success_" + item, function(err, v) {
          if (v === null || v === (void 0) || v === 'null' || v === 'undefined') {

          } else {
            lastRuns[item]['success'] = v;
          }
          return acb1(null);
        });
      }, function(err) {
        return cb1(null);
      });
    }
  ], function(err, results) {
    return renderMe(req, res);
  });
};

renderMe = function(req, res) {
  var renderHTML;
  console.log(sortKeysByOb(lastRuns));
  renderHTML = ectRender.render('pycron.ect', {
    crons: sortKeysByOb(lastRuns)
  });
  return res.render('html', {
    html: renderHTML,
    page: {
      current: 'PyCron',
      icon: 'fa-list'
    },
    user: req.user
  });
};

pycron.get("/", function(req, res) {
  return redisPull(req, res);
});

module.exports = pycron;
