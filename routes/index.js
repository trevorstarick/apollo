/*jslint node: true */
'use strict';

var express = require('express'),
  router = express.Router();

var request = require('request');
var gravatar = require('gravatar');
var Auth = require('../controllers/auth');

var analytics = require('./analytics');
var getservice = require('./getservice');

router.get('/', function(req, res) {
  var user = req.user,
    paramaters = {};

  paramaters = {
    user: user,
    page: {
      current: 'Dashboard',
      icon: 'fa-dashboard'
    }
  };

  res.render('index', paramaters);
});

router.get('/twitter', function(req, res) {
  var user = req.user,
    paramaters = {};

  paramaters = {
    user: user,
    page: {
      current: 'Twitter',
      icon: 'fa-twitter'
    }
  };

  res.render('twitter', paramaters);
});

router.get('/ios', function(req, res) {
  var user = req.user,
    paramaters = {};

  paramaters = {
    user: user,
    page: {
      current: 'iOS',
      icon: 'fa-apple'
    }
  };

  res.render('ios', paramaters);
});

router.get('/users', function(req, res) {
  var user = req.user,
    paramaters = {};

  paramaters = {
    user: user,
    page: {
      current: 'User Managment',
      icon: 'fa-users'
    }
  };

  res.render('users', paramaters);
});

router.post('/users', function(req, res) {
  var object = req.body || req.query;
  object.gravatar = gravatar.url(object.email, {});
  object.company = 'OutpostTravel';
  Auth.newUser(object);

  var user = req.user,
    paramaters = {};

  paramaters = {
    user: user,
    page: {
      current: 'User Managment',
      icon: 'fa-users'
    }
  };

  paramaters.status = 'User added successfully!';

  res.render('users', paramaters);
});

module.exports = router;