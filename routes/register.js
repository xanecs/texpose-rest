var user = require('../functions/user.js');
var restify = require('restify');

module.exports = function(req, res, next) {
    checkData(req.body, function(err) {
        if(err) {
            res.send(err);
            return;
        }
        user.register(req.body, function(err, result){
            if(err) {
                res.send(err);
                return;
            }
            res.send({
                "status": "success",
                "message": "User created"
            });
        });
    });
};

var checkData = function(data, callback) {
    if(data.username && data.password && data.firstname && data.lastname && data.email) {
        var regexMail = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if(regexMail.exec(data.email)) {
            callback(null);
            return;
        } else {
            callback(new restify.InvalidContentError('Invalid email'));
            return;
        }
    } else {
        callback(new restify.InvalidContentError('Missing one or more parameters'));
        return;
    }
    callback(new restify.InvalidContentError('Error parsing content'));
};