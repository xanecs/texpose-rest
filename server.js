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
  server: 'texpose'
});

server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(restify.bodyParser({ mapParams: false }));

/*
server.use(function(req, res, next){
  var checkRaw = new RegExp('^\/raw');
  if (checkRaw.exec(req.url)) {
    res.header('Content-Type', 'application/octet-stream');
  }
  return next();
});
*/

server.get('/hash/:input/[:salt]', function(req, res, next){
  console.log(req.url);
  res.send(200, user.calculateHash(req.params.input));
  return(next);
});

server.get('/raw/test', function(req, res, next){
  console.log(req.url);
  res.send(200, 'Kein Json');
  return(next);
});

server.post('/login', routes.login);
server.post('/register', routes.register);
server.get('/checkusername/:username', routes.checkUsername);
server.post('/renewtoken', routes.renewToken);
server.post('/getuserinfo', routes.getUserInfo);

server.listen(3000, function() {
  console.log('Server listening on port 3000');
});
