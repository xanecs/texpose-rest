var restify = require('restify');
var project = require('../../functions/project.js');
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
			project.newProject({name: req.body.name, description: req.body.description, creator: result}, function(err, result){
				if(err) {
					res.send(err);
					return;
				}
                                //process.logger.debug(result);
				res.send({result});

			});
		});
		
	});
};

var checkData = function(data, callback) {
	if(data.name && data.token) {
		callback(null);
	} else {
		callback(new restify.InvalidContentError('Missing one or more parameters'));
	}
};
