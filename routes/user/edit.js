var user = require('../../functions/user.js');
var restify = require('restify');
var authentication = require('../../functions/authentication.js');

module.exports = function(req, res, next) {
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
            req.body.username = result;
            user.edit(req.body, function(err, result){
                if(err) {
                    res.send(err);
                    return;
                }
                res.send({
                    "status": "SUCCESS",
                    "message": "Settings changed"
                });
            });
        });
    });
};

var checkData = function(data, callback) {
    if(data.email) {
        var regexMail = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
        if(regexMail.exec(data.email)) {
            callback();
            return;
        } else {
            callback(new restify.InvalidContentError('Invalid email'));
            return;
        }
    } else {
        callback();
        return;
    }
};