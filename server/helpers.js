var crypto = require('crypto');

var ø = {};

ø.genHmac = function(key,data) {
	hmac = crypto.createHmac('sha1', key);
	hmac.update(data);
	var hmac_ = hmac.digest('hex');
	console.log(hmac_);
	return hmac_;
};

module.exports = ø;