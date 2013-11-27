var file = require('../../functions/files.js');
var restify = require('restify');

module.exports = function(req, res) {
	file.saveFile({project: req.header('project'), path: req.header('path')}, req.body, function(err, result) {
		if(err) {
			res.send(err);
			return;
		}
		res.send({status: 'SUCCESS'});
	});
}