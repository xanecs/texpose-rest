var mongoose = require('mongoose');
var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var cryptography = require('./cryptography.js');
var authentication = require('./authentication.js');
var mail = require('./mail.js');

exports.register = function(options, callback) {
    checkUsername({"username": options.username}, function(err, result){
        if(err) {
            callback(err);
            return;
        }
        
        if(result) {
            callback(new restify.InvalidContentError('Username already exists'));
            process.logger.debug('Received multiple registrations for ' + options.username);
            return;
        }
        
        var newUser = new dbmodels.user({
            "username": options.username,
            "email": options.email,
            "firstname": options.firstname,
            "lastname": options.lastname,
            "hash": cryptography.calculateHash(options.password),
            "activation": {
              "token": cryptography.createToken(10)
            }
        });
        newUser.save(function(err){
            if(err) {
                callback(new restify.InternalError('Error while writing to database'));
                process.logger.error(err);
                return;
            }
            callback(null);
            process.logger.debug('New User: ' + newUser.username);
        });
        mail.sendActivation({username: options.username, token: newUser.activation.token, email: options.email}, function(err) {

        });

    });
};

exports.activate = function(options, callback) {
    getUserByUsername({username: options.username, filter: 0}, function(err, result) {
        if(err) {
            callback(err);
            return;
        }
        if(options.token != result.activation.token) {
            callback(restify.InvalidArgumentError('Invalid Token'));
            return;
        }
        result.activation.activated = true;
        result.save(function(err) {
            if(err) {
                callback(restify.InternalError('Error while querying databse'));
                process.logger.error(err);
                return;
            }
            callback(null);
        });
    });
}

/*
 * options:
 * - username
 * - password
 * - ip
 */
exports.login = function(options, callback){
    getUserByUsername({username: options.username, filter: 0}, function(err, result){
        if(err) {
            callback(err);
            return;
        }
        if(!result) {
            callback(new restify.InvalidCredentialsError('Username doesn\'t exist'));
            process.logger.debug('Rejected login of ' + options.username + ' (invalid username)');
            return;
        }

        if(!result.activation.activated) {
            callback(new restify.InvalidCredentialsError('User not activated'));
            process.logger.debug('Rejected login of ' + options.username + ' (not activated)');
            return;
        }

        if(!cryptography.checkPassword(options.password, result.hash)) {
            callback(new restify.InvalidCredentialsError('Wrong password'));
            process.logger.debug('Rejected password of ' + result.username);
            return;
        }
        authentication.newAuthentication({"username": result.username, "ip": options.ip}, function(err, token) {
            if(err) {
                callback(err);
                return;
            }
            var response = {
                authToken: token,
                //firstname: result.firstname,
                //lastname: result.lastname,
                //email: result.email,
                username: result.username,
                status: 'SUCCESS'
            };
            callback(null, response);
            process.logger.debug(result.username + ' signed in');
        });
    });
};

/*
 * options:
 * - username
 * - filter
 */
var getUserByUsername = function(options, callback) {
    dbmodels.user.findOne({"username": options.username}, function(err, result){
        if(err) {
            callback(restify.InternalError('Error while querying databse'));
            process.logger.error(err);
            return;
        }
        if(!result) {
            callback(null, null);
            return;
        }
        if(options.filter === 1) {
            var response = {
                firstname: result.firstname,
                lastname: result.lastname,
                email: result.email,
                username: result.username,
                registered: result.registered,
                friends: result.friends
            };
            callback(null, response);
        } else if(options.filter === 2) {
            var response = {
                username: result.username
            }
            callback(null, response);
        } else {
            callback(null, result);
        }
    });
};

exports.getUserByUsername = getUserByUsername;

var checkUsername = function(options, callback) {
    dbmodels.user.findOne({"username": options.username}, function(err, result){
        if(err) {
            callback(new restify.InternalError('Error while querying database'));
            process.logger.error(err);
            return;
        }
        
        if(result) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    });
};

exports.checkUsername = checkUsername;