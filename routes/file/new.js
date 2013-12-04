var file = require('../../functions/files.js');
var restify = require('restify');
var authentication = require('../../functions/authentication.js');
var project = require('../../functions/project.js');

module.exports = function(req, res) {
	authentication.checkAuthentication({token: req.header('token'), ip: req.connection.remoteAddress}, function(err, result) {
		if(err) {
			res.send(err);
			return;
		}
		project.isAuthenticated({username: result, project: req.header('project')}, function(err, result){
			if(err) {
				res.send(err);
				return;
			}

			file.saveFile({project: req.header('project'), path: req.header('path')}, req.body, function(err, result) {
				if(err) {
					res.send(err);
					return;
				}
				res.send({status: 'SUCCESS'});
			});
		});
	});
}