var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var mailgun = require('mailgun').Mailgun;
var config = require('../config.json');
var path = require('path')

var sendMail = function(options, callback) {
	var mg = new mailgun(config.mailgunKey);
	mg.sendText(config.mailgunSender, options.receiver, options.subject, options.text, function(err) {
		if(err) {
			callback(new restify.InternalError('Error while sending Mail'));
			process.logger.error(err);
			return;
		}
		callback(null);
	})
};

exports.sendActivation = function(options, callback) {
	fs.readFile(path.resolve(__dirname, '../template/activatemail.txt'), function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while reading template'));
			process.logger.error(err);
			return;
		}
		var resultT = '' + result;
		var text = resultT.replace('$LINK$', config.webroot + '/user/activate/' + options.username + '/' + options.token);
		sendMail({receiver: options.email, text: text, subject: 'TeXpose'}, function(err) {
			if(err) {
				callback(err);
				return;
			}
			callback(null);
		});
	});
};