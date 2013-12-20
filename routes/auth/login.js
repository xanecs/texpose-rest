var user = require('../../functions/user.js');
var restify = require('restify');

module.exports = function(req, res, next) {
    checkData(req.body, function(err){
    	if(err) {
    		res.send(err);
    		return;
    	}
    	user.login({
    		username: req.body.username,
    		password: req.body.password,
    		ip: req.connection.remoteAddress
    	}, function(err, result) {
    		if(err) {
    			res.send(err);
    			return;
    		}
    		res.send(result);
    	});
    }); 
};

var checkData = function(data, callback) {
    if(data.username && data.password) {
        callback(null);
    } else {
        callback(new restify.InvalidContentError('Missing one or more parameters'))
    }
};