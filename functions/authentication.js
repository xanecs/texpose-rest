var dbmodels = require('./dbmodels.js');
var mongoose = require('mongoose');
var restify = require('restify');
var config = require('../config.json');
var cryptography = require('./cryptography.js');

/*
 * options:
 * - ip
 * - token
 */
exports.checkAuthentication = function(options, callback) {
  dbmodels.authToken.findOne({"token": options.token}, function(err, result){
    if(err) {
        //Token doesn't exist
        callback(new restify.NotAuthorizedError('Not logged in'));
        return;
    }
    if(!result) {
        callback(new restify.NotAuthorizedError('Not logged in'));
        return;
    }
    if((Date.now() - result.lastuse) / 1000 > config.session_ttl) {
        //Token has expired
        callback(new restify.NotAuthorizedError('Token expired (Timeout)'));
        return;
    }
    if(result.ip != options.ip) {
        //IP changed since last use
        callback(new restify.NotAuthorizedError('Token expired (IP)'));
        return;
    }
    result.lastuse = Date.now();
    result.ip = options.ip;
    result.save(function(err){
        if(err) {
            callback(err);
            return;
        }
        callback(null, result.username);
    });
  });
};

/*
 * options:
 * - ip
 * - username
 */
exports.newAuthentication = function(options, callback) {
    dbmodels.authToken.find({"username": options.username}, function(err, result) {
        if(err) {
            callback(err);
            return;
        }
        result.forEach(function(doc){
            doc.remove();
        });
        var newAuth = new dbmodels.authToken({
            "token": cryptography.createToken(16),
            "username": options.username,
            "lastuse": Date.now(),
            "ip": options.ip
        });
        newAuth.save(function(err){
            if(err) {
                callback(err);
                return;
            }
            callback(null, newAuth.token);
        });
    });
    
};
