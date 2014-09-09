/*jslint node: true */
'use strict';

var express = require('express'),
  bodyParser = require('body-parser');

var routes = require('./routes.js');

var app = express();
app.use( bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

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

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', '*');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/', function(req, res){
  res.send('hello world!');
});

app.use('/', routes);

app.listen(process.env.PORT || 3000);
