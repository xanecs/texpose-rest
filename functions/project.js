var dbmodels = require('./dbmodels.js');
var restify = require('restify');
var fs = require('fs');
var config = require('../config.json');
var files = require('./files.js');
var path = require('path');

exports.newProject = function(options, callback) {
	var newProject = new dbmodels.project({
		"name": options.name,
		"description": options.description,
		"mainfile": "main.tex",
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
			process.logger.error(err);
			return;
		}

		fs.mkdir(config.data_dir + '/' + result._id, 0777, function(err) {
			if(err) {
				callback(new restify.InternalError('Error while creating directory'));
				return;
			}

            var data = fs.createReadStream(path.resolve(__dirname, config.tex_template));

            files.saveFile({project: result._id, path: 'main.tex'}, data, function(err) {
                if(err) {
                    callback(new restify.InternalError('Error while copying template'));
                    return;
                }
                callback(null, result);
            });
			
		});
		
	});
};

exports.delete = function(options, callback) {
	exists({project: options.project}, function(err, ex, result) {
		if(err) {
			callback(err);
			return;
		}

		if(!ex) {
			callback(new restify.InvalidArgumentError('This project does not exist'));
			return;
		}

		dbmodels.project.remove({_id: options.project}, function(err) {
			if(err) {
				callback(new restify.InternalError('Error while removing item from database'));
				process.logger.error(err);
				return;
			}
			callback(null, true);
		});

		dbmodels.file.remove({project: options.project}, function(err) {
			if(err) {
				process.logger.error(err);
			}
		})
	});
}

exports.listProjects = function(options, callback) {
	dbmodels.project.find({permissions: {$elemMatch: {username: options.username, role: {$gt: 0}}}}, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			process.logger.error(err);
			return;
		}
		callback(null, result);
	});
};

var exists = function(options, callback) {
	dbmodels.project.findById(options.project, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}
		if(result) {
			callback(null, true, result);
		} else {
			callback(null, false);
		}
	});
};

exports.exists = exists;

exports.isAuthenticated = function(options, callback) {
	exports.listProjects({username: options.username}, function(err, result){
		if(err) {
			callback(err);
			return;
		}
		for(var i = 0; i < result.length; i++) {
			if(result[i]._id == options.project.toString()) {
				callback(null, true);
				return;
			}
		}
		callback(new restify.InvalidArgumentError('You are not authenticated for this project'));
	});
};

exports.changeSettings = function(options, callback) {
	dbmodels.project.findById(options.project, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}

		if(!result) {
			callback(new restify.InvalidArgumentError('This project does not exist'));
			return;
		}

		if(options.name) {
			result.name = options.name;
		}

		result.description = options.description;

		if(options.mainfile) {
			result.mainfile = options.mainfile;
		}

		result.save(function(err, result) {
			if(err) {
				callback(new restify.InternalError('Error while writing to database'));
				return;
			}
			callback(null, result);
		});
	});
};

exports.compile = function(options, callback) {
	dbmodels.project.findById(options.project, function(err, result) {
		if(err) {
			callback(new restify.InternalError('Error while querying database'));
			return;
		}

		dbmodels.file.find({project: result._id}, function(err, files){
			if(err) {
				callback(new restify.InternalError('Error while getting files'));
				return;
			}
			var fileParam = [];
			for(var i = 0; i < files.length; i++) {
				fileParam.push({
					path: files[i].path,
					url: config.url + '/file/get/' + result._id + '/' + config.dlbsToken + '/' + encodeURIComponent(files[i].path)
				});
			}

			process.dlbsClient.post('/compile', {
			format: "pdf",
			mainfile: result.mainfile,
			files: fileParam

			}, function(err, req, res, obj) {
				if(err) {
					callback(new restify.InternalError('Error while compiling document'));
					process.logger.error(err);
					return;
				}
				callback(null, obj);
				var newJob = new dbmodels.dlbsjob({
					jobid: obj.jobid,
					project: options.project
				});
				newJob.save(function(err, result){
					if(err) {
						process.logger.error(err);
						return;
					}
				});
			});
		});

		
	});
}
