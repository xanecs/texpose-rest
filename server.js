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

server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: false }));

server.post('/auth/login', routes.auth.login);
server.post('/user/register', routes.user.register);
server.get('/user/checkusername/:username', routes.user.checkUsername);
server.post('/auth/renewtoken', routes.auth.renewToken);
server.post('/auth/getuserinfo', routes.auth.getUserInfo);
server.post('/project/new', routes.project.new);
server.post('/project/list', routes.project.list);
server.post('/file/new', routes.file.new);
server.post('/file/get', routes.file.get);
server.post('/file/list', routes.file.list);
server.listen(config.port, function() {
  console.log('Server listening on port ' + config.port);
});
