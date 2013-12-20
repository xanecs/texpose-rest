var restify = require('restify');
var authentication = require('../../functions/authentication.js');
var config = require('../../config.json');
var dlbs = require('../../functions/dlbs.js');

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
			dlbs.isAuthenticated({username: result, jobid: req.body.jobid}, function(err, result){
				if(err) {
					res.send(err);
					return;
				}
				dlbs.getStatus({jobid: req.body.jobid}, function(err, result) {
					if(err) {
						res.send(err);
						return;
					}
					res.send(result);
				})
			});
		});
		
	});
};

var checkData = function(data, callback) {
	if(data.token && data.jobid) {
		callback(null);
	} else {
		callback(new restify.InvalidContentError('Missing one or more parameters'));
	}
};