var Tail = require('tail').Tail;
tail = new Tail('/var/logs/apache/access.logs');

tail.on("line", function(stdin) {
	console.log(stdin);
});

tail.on("error", function(error) {
  console.log('ERROR: ', error);
});