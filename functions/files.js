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
	exists({project: options.project, path: options.path}, function(err, result) {
		if(err) {
			callback(err);
			return;
		}
		fs.readFile(config.data_dir + '/' + options.project + '/' + options.path, function(err, data) {
			if(err) {
				callback(new restify.InternalError('Error while reading file'));
			}
			callback(null, data);
		});
	});
};

exports.listFiles = function(options, callback) {
	dbmodels.file.find({project: options.project}, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}

		var input = [];
		var output = [];

		for(var c = 0; c < result.length; c++) {
			input.push(result[c].path);
		}

		for (var i = 0; i < input.length; i++) {
		    var chain = input[i].split("/");
		    var currentNode = output;
		    for (var j = 0; j < chain.length; j++) {
		        var wantedNode = chain[j];
		        var lastNode = currentNode;
		        for (var k = 0; k < currentNode.length; k++) {
		            if (currentNode[k].name == wantedNode) {
		                currentNode = currentNode[k].data;
		                break;
		            }
		        }

		        if (lastNode == currentNode) {
		        	if(chain.length - 1 != j) {
		            	var newNode = currentNode[k] = {data: wantedNode, children: []};
		        	} else {
		        		var newNode = currentNode[k] = wantedNode;
		        	}
		            currentNode = newNode.children;
		        }
		    }
		}
		callback(null, {data: output});
	});
};