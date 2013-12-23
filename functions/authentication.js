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
        callback(new restify.InternalError('Error while querying database'));
        process.logger.error(err);
        return;
    }
    if(!result) {
        callback(new restify.NotAuthorizedError('Not logged in'));
        return;
    }
    if((Date.now() - result.lastuse) / 1000 > config.session_ttl) {
        //Token has expired
        callback(new restify.NotAuthorizedError('Token expired (Timeout)'));
        process.logger.debug('Rejected token to username ' + result.username + ' from IP ' + options.ip + '(Expired)');
        return;
    }
    if(result.ip != options.ip) {
        //IP changed since last use
        callback(new restify.NotAuthorizedError('Token expired (IP)'));
        process.logger.debug('Rejected token to username ' + result.username + ' from IP ' + options.ip + '(IP Changed)');
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
        process.logger.debug('Accepted token to username ' + result.username + ' from IP ' + options.ip);
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
            callback(new restify.InternalError('Error while querying database'));
            process.logger.error(err);
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
                callback(new restify.InternalError('Error while writing to database'));
                process.logger.error(err);
                return;
            }
            process.logger.debug('Issued token to username ' + options.username + ' from IP ' + options.ip);
            callback(null, newAuth.token);
        });
    });
    
};
