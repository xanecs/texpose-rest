var restify = require('restify');
var project = require('../../functions/project.js');
var file = require('../../functions/files.js');
var authentication = require('../../functions/authentication.js');

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
			project.isAuthenticated({username: result, project: req.body.project}, function(err, result){
				if(err) {
					res.send(err);
					return;
				}
				file.listFiles({project: req.body.project}, function(err, result){
					if(err) {
						res.send(err);
						return;
					}
					res.send(result);
				});
			});
		});
		
	});
};

var checkData = function(data, callback) {
	if(data.project && data.token) {
		callback(null);
	} else {
		callback(new restify.InvalidContentError('Missing one or more parameters'));
	}
};