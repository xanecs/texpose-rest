var colors = require('colors');

var createTimestamp = function(level) {
	var colorLevel;
	switch(level) {
		case 'debug':
			colorLevel = 'DBG'.white;
			break;
		case 'info':
			colorLevel = 'INF'.blue;
			break;
		case 'warn':
			colorLevel = 'WRN'.yellow;
			break;
		case 'error':
			colorLevel = 'ERR'.red;
	}
	var timestamp = new Date(Date.now());
	return '[ ' + colorLevel + ' | ' + timestamp.toLocaleTimeString() + ' ] ';
}

exports.debug = function(object) {
	console.log(createTimestamp('debug') + object);
}

exports.info = function(object) {
	console.log(createTimestamp('info') + object);
}

exports.warn = function(object) {
	console.log(createTimestamp('warn') + object);
}

exports.error = function(object) {
	console.log(createTimestamp('error') + object);
}