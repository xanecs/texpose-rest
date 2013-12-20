var restify = require('restify');
var authentication = require('../../functions/authentication.js');
var config = require('../../config.json');
var dlbs = require('../../functions/dlbs.js');

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
			dlbs.isAuthenticated({username: result, jobid: req.params.jobid}, function(err, result){
				if(err) {
					res.send(err);
					return;
				}
				dlbs.getResult({jobid: req.params.jobid}, function(err, result) {
					if(err) {
						res.send(err);
						return;
					}
					res.setHeader('content-type', 'application/pdf');
					res.writeHead(200);
					result.on('data', function(chunk) {
						res.write(chunk);
					});
					result.on('end', function() {
						res.end();
					});
					

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