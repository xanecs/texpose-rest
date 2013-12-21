var user = require('../../functions/user.js');
var restify = require('restify');

module.exports = function(req, res, next) {
    checkData(req.params, function(err) {
        if(err) {
            res.send(err);
            return;
        }
        user.activate(req.params, function(err, result){
            if(err) {
                res.send(err);
                return;
            }
            res.send("Confirmation successful!");
        });
    });
};

var checkData = function(data, callback) {
    if(data.username && data.token) {
        callback(null);
    } else {
        callback(new restify.InvalidContentError('Missing one or more parameters'));
        return;
    }
};