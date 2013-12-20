var restify = require('restify');
var project = require('../../functions/project.js');
var file = require('../../functions/files.js');
var authentication = require('../../functions/authentication.js');
var config = require('../../config.json');

module.exports = function(req, res) {
	checkData(req.params, function(err) {
		if(err) {
			res.send(err);
			return;
		}

		if(req.params.token == config.dlbsToken) {
			sendData(req, res);                          
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
				sendData(req, res);
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

var sendData = function(req, res, callback) {
	file.getFile({project: req.params.project, path: decodeURIComponent(req.params.path)}, function(err, file){
		if(err) {
			res.send(err);
			if(callback) {
				callback(err);
			}
			return;
		}
		res.setHeader('content-type', 'application/octet-stream');
		res.writeHead(200);
		res.write(file);
		res.end();
		if(callback) {
			callback(err);
		}
	});
};