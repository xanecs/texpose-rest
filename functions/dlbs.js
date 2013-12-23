var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var config = require('../config.json');
var files = require('./files.js');
var project = require('./project.js');
var url = require('url');
var http = require('http');

var getStatus = function(options, callback) {
	dbmodels.dlbsjob.findOne({jobid: options.jobid}, function(err, result){
		if(err) {
			callback(new restify.InternalError('Error while querying databse'));
			process.logger.error(err);
			return;
		}

		if(!result) {
			callback(new restify.InvalidArgumentError('This job doesn\'t exist'));
			return;
		}
		process.logger.debug('Getting status of job: ' + options.jobid);
		process.dlbsClient.post('/getjob', {
			jobid: options.jobid
		}, function(err, req, res, obj) {
			if(err) {
				callback(new restify.InternalError('Error while getting status from build server'));
				process.logger.error(err);
				return;
			}
			callback(null, obj);
		})
	});
};

exports.getStatus = getStatus;

exports.getResult = function(options, callback) {
	getStatus({jobid: options.jobid}, function(err, result) {
		if(err) {
			callback(err);
			return;
		}
		if(result.state != 'done') {
			callback(new restify.InvalidArgumentError('Job is not done yet'));
			return;
		}
		console.log(url.parse(result.output.document).path);
		var rqurl = url.parse(result.output.document);
		var rqoptions = {hostname: rqurl.hostname, port: rqurl.port, path: rqurl.path, method: 'GET'};
		process.logger.debug('Retreiving result of job: ' + result.jobid);
		http.request(rqoptions, function(res) {
			callback(null, res);
		}).end();
	});
};

exports.getLog = function(options, callback) {
	getStatus({jobid: options.jobid}, function(err, result) {
		if(err) {
			callback(err);
			return;
		}
		if(result.state != 'done') {
			callback(new restify.InvalidArgumentError('Job is not done yet'));
			return;
		}
		process.logger.debug('Retreiving result of job: ' + result.jobid);
		process.dlbsClient.get(url.parse(result.output.log).path, function(err, req, res, obj) {
			if(err) {
				callback(new restify.InternalError('Error while retrieving document from build server'));
				process.logger.error(err);
				return;
			}
			callback(null, res.body);
		});
	});
};

exports.isAuthenticated = function(options, callback) {
	dbmodels.dlbsjob.findOne({jobid: options.jobid}, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying databse'));
			process.logger.error(err);
			return;
		}
		project.isAuthenticated({username: options.username, project: result.project}, function(err, authenticated) {
			if(!authenticated) {
				callback(new restify.InvalidArgumentError('You\'re not authenticated for this job'), false);
				return;
			}
			callback(null, true);
		});
	});
	
};