exports.create = function(req,res){
  console.log(req.body);
  var object = {
    token: req.body.token,
    name: req.body.name,
    description: req.body.description,
    type: req.body.type,
    private: req.body.private,
  };
  if (req.body.token) {
    var uuid = ø.genHmac(object.token,object.name);
    rdb.get(uuid,function(err,reply){
      if(!reply) {
        rdb.set(uuid, JSON.stringify(object), function(){
          res.status(201).jsonp({
            module_token:uuid
          });
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
      message: 'Expected token. Got null'
    });
  }
};