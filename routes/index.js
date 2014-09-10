var express = require('express');
var Auth = require('../controllers/auth.js');
var app = express.Router();

app.use(function(req, res, next) {
  // console.log(!req.isAuthenticated(), req.url !== '/login');
  if (!req.isAuthenticated() && req.url !== '/login') {
    res.render('login', {
      layout: false,
      user: req.user,
      message: req.session.messages
    });
  }
  next();
});