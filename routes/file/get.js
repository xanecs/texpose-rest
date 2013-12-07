var restify = require('restify');
var project = require('../../functions/project.js');
var file = require('../../functions/files.js');
var authentication = require('../../functions/authentication.js');

module.exports = function(req, res) {
	checkData(req.params, function(err) {
		if(err) {
			res.send(err);
			return;
		}
		authentication.checkAuthentication({token: req.params.token, ip: req.connection.remoteAddress}, function(err, result) {
			if(err) {
				res.send(err);
				return;
			}
			project.isAuthenticated({username: result, project: req.params.project}, function(err, result){
				if(err) {
					res.send(err);
					return;
				}
				file.getFile({project: req.params.project, path: decodeURIComponent(req.params.path)}, function(err, file){
					if(err) {
						res.send(err);
						return;
					}
					res.setHeader('content-type', 'application/octet-stream');
					res.writeHead(200);
					res.write(file);
					res.end();
				});
			});
		});
		
	});
};

var checkData = function(data, callback) {
	if(data.project && data.token && data.path) {
		callback(null);
	} else {
		callback(new restify.InvalidContentError('Missing one or more parameters'));
	}
};