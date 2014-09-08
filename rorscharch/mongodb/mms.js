var request = require('request');

var USERNAME = 'trevor@outpost.travel';
var API_KEY = 'a32b8bd1-af79-429f-83d8-9c98d1474a85';

var GROUP = '5231dbe27ec5df2d7b03fe5b';
var HOST = '3c07e4304182bad6142c201640c69246';

var url = 'https://mms.mongodb.com/api/public/v1.0';
// url += '/groups';
url += '/groups/'+ GROUP;
// url += '/hosts';
url += '/hosts/' + HOST;
url += '/metrics';

console.log(url);

request({
	uri  : url,
	json : true,
	auth : {
		user : USERNAME,
    	pass : API_KEY,
    	sendImmediately : false
	}
}, function(e,r,b) {
	console.log(b);
});