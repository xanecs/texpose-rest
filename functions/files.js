var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var nodefs = require('node-fs')
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
				fs.mkdir(config.data_dir + '/' + options.project + '/' + options.path.substring(0, options.path.lastIndexOf("/")), 0777, true, function (err) {
				    if (err) {
				    	console.log(err);
				    	return;
				    }
				    fs.writeFile(config.data_dir + '/' + options.project + '/' + options.path, file, function(err) {
				    	console.log(err);
				    });
				});
				
				
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
					dbmodels.file.remove({_id: result._id}, function(err){  });
					callback(null, false);
				}
			});
		} else {
			callback(null, true);
		}
	});
};

exports.deleteFile = function(options, callback) {
	dbmodels.file.remove({path: options.path, project: options.project}, function(err, result){
		if(err) {
			callback(new restify.InternalError('Error while removing item from database'));
			return;
		}
		callback(null);
	});
	fs.unlink(options.path, function(err){  });
};

exports.getFile = function(options, callback) {
	exists({project: options.project, path: options.path, fs: true}, function(err, result) {
		if(err) {
			callback(err);
			return;
		}
		if(!result) {
			callback(new restify.InvalidArgumentError('File doesn\'t exist'));
			return;
		}
		fs.readFile(config.data_dir + '/' + options.project + '/' + options.path, function(err, data) {
			if(err) {
				callback(new restify.InternalError('Error while reading file'));
				return;
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
		            if (currentNode[k].data == wantedNode) {
		                currentNode = currentNode[k].children;
		                break;
		            }
		        }

		        if (lastNode == currentNode) {
		        	if(chain.length - 1 != j) {
		            	var newNode = currentNode[k] = {data: wantedNode, attr: {leaf: false} , children: []};
		        	} else {
		        		var newNode = currentNode[k] = {data: wantedNode, attr: {path: input[i], leaf: true}};
		        	}
		            currentNode = newNode.children;
		        }
		    }
		}
		callback(null, {data: output});
	});
};