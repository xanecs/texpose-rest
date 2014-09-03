#!/usr/bin/env node
require('newrelic');

var restify = require('restify');
var fs = require('fs');
var user = require('./functions/user.js');
var config = require('./config.json');
var mongoose = require('mongoose');
var routes = require('./routes');

process.logger = require('./functions/logger.js');

console.log(process.env.MONGO_URL);

var database = process.env.MONGO_URL || config.database;

mongoose.connect(database, {}, function(err){
    if(err) {
        process.logger.error(err);
    } else {
        process.logger.info('Database connection established to ' + config.database);
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
        //console.log('received an options method request');
        var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'Project', 'Token', 'Path']; // added Origin & X-Requested-With
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
        res.header('Access-Control-Allow-Methods', res.methods.join(', '));
        res.header('Access-Control-Allow-Origin', req.headers.origin);

        return res.send(204);
}

server.use(restify.fullResponse());
//server.use(restify.bodyParser());
server.use(function(req, res, next) {
    process.logger.debug('Request to: ' + req.url);
    return next();
});

server.on('MethodNotAllowed', unknownMethodHandler);

var bpo = {mapParams: false};

server.post('/user/register', restify.bodyParser(bpo), routes.user.register);
server.get('/user/checkusername/:username', routes.user.checkUsername);
server.get('/user/activate/:username/:token', restify.bodyParser(), routes.user.activate);
server.post('/user/edit', restify.bodyParser(bpo), routes.user.edit);

server.post('/auth/login', restify.bodyParser(bpo), routes.auth.login);
server.post('/auth/renewtoken', restify.bodyParser(bpo), routes.auth.renewToken);
server.post('/auth/getuserinfo', restify.bodyParser(bpo), routes.auth.getUserInfo);

server.post('/project/new', restify.bodyParser(bpo), routes.project.new);
server.post('/project/list', restify.bodyParser(bpo), routes.project.list);
server.post('/project/compile', restify.bodyParser(bpo), routes.project.compile);
server.post('/project/edit', restify.bodyParser(bpo), routes.project.edit);
server.post('/project/delete', restify.bodyParser(bpo), routes.project.delete);

server.post('/file/new', routes.file.new);
server.get('/file/get/:project/:token/:path', routes.file.get);
server.post('/file/list', restify.bodyParser(bpo), routes.file.list);
server.post('/file/delete', restify.bodyParser(bpo), routes.file.delete);
server.post('/file/rename', restify.bodyParser(bpo), routes.file.rename);

server.post('/job/status', restify.bodyParser(bpo), routes.job.status);
server.get('/job/result/:jobid/:token', routes.job.result);
server.get('/job/log/:jobid/:token', routes.job.log);

process.dlbsClient = restify.createJsonClient({url: config.dlbs});

var port = process.env.PORT || config.port

server.listen(port, function() {
    process.logger.info('Server listening on port ' + config.port);
});
