var restify = require('restify');
var user = require('../functions/user.js');
var authentication = require('../functions/authentication.js');

module.exports = function(req, res) {
	checkData(req.body, function(err) {
		if(err) {
			res.send(err);
			return;
		}
		authentication.checkAuthentication({token: req.body.token, ip: req.connection.remoteAddress}, function(err, result) {
			if(err) {
				res.send(err);
				return;
			}
			user.getUserByUsername({username: result, filter: 1}, function(err, result) {
				if(err) {
					res.send(err);
					return;
				}
				result.status = 'SUCCESS';
				res.send(result);
			});
		});
	});
};

var checkData = function(data, callback) {
	if(data.token) {
		callback(null);
	} else {
		callback(new restify.InvalidContentError('Error parsing content'));
	}
};