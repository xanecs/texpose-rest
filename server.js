#!/usr/bin/env node

var restify = require('restify');
var fs = require('fs');
var user = require('./functions/user.js');
var config = require('./config.json');
var mongoose = require('mongoose');
var routes = require('./routes');

mongoose.connect(config.database, {}, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log('Database connection established to ' + config.database);
  }
});

var server = restify.createServer({
  //certificate: fs.readFileSync('./ssl/server.crt'),
  //key: fs.readFileSync('./ssl/server.key'),
  name: 'texpose'//,
  //formatters: {
  //	'image/jpeg; q=0.9': function(req, res, body) {
  //		res.setHeader('content-type', 'image/jpeg');
  //		return body;
  //	}
  //}
});

function unknownMethodHandler(req, res) {
    if (req.method.toLowerCase() === 'options') {
	    //console.log('received an options method request');
	    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Project', 'Token', 'Path']; // added Origin & X-Requested-With

	    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

	    res.header('Access-Control-Allow-Credentials', true);
	    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
	    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
	    res.header('Access-Control-Allow-Origin', req.headers.origin);

	    return res.send(204);
    }
    else
    	return res.send(new restify.MethodNotAllowedError());
}

server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: false }));
server.on('MethodNotAllowed', unknownMethodHandler);

server.post('/auth/login', routes.auth.login);
server.post('/user/register', routes.user.register);
server.get('/user/checkusername/:username', routes.user.checkUsername);
server.post('/auth/renewtoken', routes.auth.renewToken);
server.post('/auth/getuserinfo', routes.auth.getUserInfo);
server.post('/project/new', routes.project.new);
server.post('/project/list', routes.project.list);
server.post('/file/new', routes.file.new);
server.get('/file/get/:project/:token/:path', routes.file.get);
server.post('/file/list', routes.file.list);
server.post('/file/delete', routes.file.delete);
server.listen(config.port, function() {
  console.log('Server listening on port ' + config.port);
});
