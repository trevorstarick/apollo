// https://github.com/google/google-api-nodejs-client/

var request = require('request');

var google = require('googleapis'),
	analytics = google.analytics('v3');

var SERVICE_ACCOUNT_EMAIL = '599475914618-lkm8nt6as8k6i7i1ntjjnh0naapsn824@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = __dirname+'/googleapi-privatekey.pem';

var jwt = new google.auth.JWT(
        SERVICE_ACCOUNT_EMAIL,
        SERVICE_ACCOUNT_KEY_FILE,
        null,
        ['https://www.googleapis.com/auth/analytics.readonly']);

var GA = {
	realtime: {
		_generator: function(metric, cb) {
			analytics
				.data
				.realtime
				.get({
					"auth": jwt,
				    "ids": "ga:70768966",
				    "metrics": 'rt:'+metric
				}, function(e,r){
					if(cb) return cb(e,r);
					console.log(r);
				});
		}
	}
};

function requestData() {
	GA.realtime._generator('activeUsers');
	GA.realtime._generator('location');
	GA.realtime._generator('pageviews');
}

jwt.authorize(function(err,tokens) {
	if (err) {
		console.log(err);
		return;
	} else {
		console.log(tokens);
	}
	requestData();
});