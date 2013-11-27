var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var config = require('../config.json');
var project = require('./project.js')

exports.saveFile = function(options, file, callback) {
	exists(options, function(err, result){
		if(err) {
			callback(err);
			return;
		}
		if(result) {
			fs.writeFile(config.data_dir + '/' + options.project + '/' + options.path, file, function(err) {
				if(err) {
					callback(new restify.InternalError('Error while writing file to disk'));
					return;
				}
				callback(null, true);
			});
		} else {
			project.exists({project: options.project}, function(err, result) {
				if(err) {
					callback(err);
					return;
				}
				fs.writeFile(config.data_dir + '/' + options.project + '/' + options.path, file, function(err) {});
				
				var newFile = new dbmodels.file({
					project: options.project,
					path: options.path
				});
				newFile.save();
				callback(null, false);
			});
		}
	});
};

var exists = function(options, callback) {
	dbmodels.file.findOne({project: options.project, path: options.path}, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}
		if(!result) {
			callback(null, false);
			return;
		}
		if(options.fs === true) {
			fs.exists(config.data_dir + '/' + result.project + '/' + result.path, function(exists) {
				if(exists) {
					callback(null, true);
				} else {
					result.remove();
					callback(null, false);
				}
			});
		} else {
			callback(null, true);
		}
	});
};

exports.deleteFile = function(options, callback) {

};

exports.getFile = function(options, callback) {

};

exports.listFiles = function(options, callback) {

};