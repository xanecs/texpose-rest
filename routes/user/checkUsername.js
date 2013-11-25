var user = require('../../functions/user.js');
var restify = require('restify');

module.exports = function(req, res, next) {
    user.checkUsername({"username": req.params.username}, function(err, result) {
        if(err) {
            res.send(err);
            return;
        }
        if(result) {
            res.send({
                "status": "success",
                "value": true,
                "message": "Username exists"
            });
        } else {
            res.send({
                    "status": "success",
                    "value": false,
                    "message": "Username doesn't exist"
            });
        }
    });
};