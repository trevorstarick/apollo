/*jslint node: true */
'use strict';

var express = require('express'),
  bodyParser = require('body-parser');

var redis = require('redis'),
  rdb = redis.createClient();

var ø = require('./helpers.js');
var routes = require('./routes.js');

var app = express();
app.use( bodyParser.urlencoded({ extended: false }));


express.response.jsonp = function(obj) {
  var replacer = app.get('json replacer');
  var spaces = app.get('json spaces');
  var body = JSON.stringify(obj, replacer, spaces)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  var callback = this.req.query[app.get('jsonp callback name')];

  this.set('Content-Type', 'application/json');

  if (Array.isArray(callback)) {
    callback = callback[0];
  }

  if (callback && 'string' === typeof callback) {
    this.set('Content-Type', 'text/javascript');
    var cb = callback.replace(/[^\[\]\w$.]/g, '');
    body = cb + '(' + body + ');';
  }

  return this.send(body);
};

app.get('/', function(req, res){
  res.send('hello world!');
});

app.use('/modules', routes);

app.listen(process.env.PORT || 8080);
