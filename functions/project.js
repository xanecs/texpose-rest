var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var config = require('../config.json');

exports.newProject = function(options, callback) {
	var newProject = new dbmodels.project({
		"name": options.name,
		"description": options.description,
		"permissions": [
			{
				"username": options.creator,
				"role": "owner"
			}
		]
	});

	newProject.save(function(err, result){
		if(err) {
			callback(new restify.InternalError('Error while creating object'));
			console.log(err);
			return;
		}
		fs.mkdir(config.data_dir + '/' + result._id, 0777, function(err) {
			if(err) {
				callback(new restify.InternalError('Error while creating directory'));
				return;
			}
			callback(null, result);
		});
		
	});
};

exports.listProjects = function(options, callback) {
	dbmodels.project.find({permissions: {$elemMatch: {username: options.username, role: {$gt: 0}}}}, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}
		callback(null, result);
	});
};

exports.exists = function(options, callback) {
	dbmodels.project.findById(options.project, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}
		if(result) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	});
}