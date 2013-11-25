var restify = require('restify');
var authentication = require('../../functions/authentication.js');

module.exports = function(req, res) {
	var authToken = req.body.token;
	if(authToken) {
		authentication.checkAuthentication({ip: req.connection.remoteAddress, token: authToken}, function(err, result){
			if(err) {
				res.send(err);
				return;
			}
			res.send({
				status: 'SUCCESS',
				username: result
			});
		});
	} else {
		res.send(new restify.InvalidContentError('Missing one or more parameters'))
	}
};