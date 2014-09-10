var router = require('express').Router();

var mongoose = require('mongoose');
var conn = mongoose.createConnection('mongodb://localhost/modules');

var Schema = mongoose.Schema;

var moduleSchema = new Schema({
  name:  String,
  description: String,
  token: String,
  type: String,
  data: Array,
  timestamp: Array,
  uuid: String
});

var Collection = conn.model('Module', moduleSchema);

var ø = require('./helpers.js');

var Status = {};
var Module = {};

/**
 * Types
 *   type   example
 *   ----   -------
 *   bool   isUp?
 *   float  response time
 *   int    number of users
 *   event  button clicked
 */

Status.OK = function(req,res) {
  res.status(200).send('OK');
};


Module.create = function(req,res) {
  var object = {
    token: req.body.token,
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    data: [],
    timestamp: [],
    uuid: ''
  };

  if (req.body.token) {
    var uuid = ø.genHmac(object.token,object.name);
    object.uuid = uuid;

    Collection.find({uuid:uuid},function(err,reply) {
      if(err) throw err;
      if(!reply.length) {
        console.log(object);
        var item = new Collection(object);
        item.save(function(e,r){
          if(e) {
            throw e;
          } else {
            console.log(uuid,'saved...');
            r.status = 'success';
            res.status(200).jsonp(r);
          }
        });
      } else {
        res.status(202).jsonp({
          error: 'Module already exists',
          message: 'Module already exists. Please use /modules/update instead. If you think this is an issue, hit up @trevorstarick.'
        });
      }
    });
  } else {
    res.status(400).jsonp({
      error: 'Missing token',
      message: 'Expected token. Got null.'
    });
  }
};

Module.read = function(req,res) {
  console.log(req.query);
  var uuid = req.query.uuid;
  Collection.find({uuid:uuid},function(err,reply) {
    if(!reply) {
      res.status(404).jsonp({
        error: 'Module doesn\'t exist',
        message: 'Whooops there it isn\'t'
      });
    } else {
      if(JSON.parse(reply).token === req.query.token) {
        res.status(200).end(reply);
      } else {
        res.status(400).jsonp({
          error: 'Missing or incorrect token',
          message: 'Token failed'
        });
      }
    }
  });
};

Module.list = function(req,res) {
  Collection.find( function(err,reply) {
    res.status(200).jsonp({keys:reply});
  });
};

Module.update = function(req,res) {
  console.log(req.body);
  var uuid = req.body.uuid;
  var token = req.body.token;
  var data =  req.body.data;
  var timestamp = req.body.timestamp || Date.now();

  Collection.find({uuid:uuid, token: token}, function(err,reply) {
    if(err) throw err;
    console.log(data,timestamp);

    Collection.update({uuid:uuid, token:token},{
        '$push':{
          data: data,
          timestamp: timestamp
      }
    }, function(e,r){
      if(e) throw e;
      console.log(r);
      Status.OK(req,res);
    });
  });
};

router.get('/', Status.OK);

router.get('/create', Status.OK);
router.post('/create', Module.create);
router.get('/read', Module.read);
router.get('/list', Module.list);
router.post('/update', Module.update);

module.exports = router;