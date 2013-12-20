var mongoose = require('mongoose');

exports.user = mongoose.model('User', {
  "username": String,
  "email": String,
  "firstname": String,
  "lastname": String,
  "registered": {type: Date, default: Date.now()},
  "hash": String,
  "mainfile": String,
  "friends": [
    {
      "username": String,
      "added": {type: Date, default: Date.now()}
    }
  ],
  "activation": {
    "activated": {type: Boolean, default: false},
    "token": String
  },
  "passwordReset": {
    "token": String,
    "created": {type: Date, default: Date.now},
    "valid": {type: Boolean, default: false}
  }
});

exports.authToken = mongoose.model('AuthToken', {
  "token": String,
  "username": String,
  "lastuse": Date,
  "ip": String
});

exports.project = mongoose.model('Project', {
  "name": String,
  "description": String,
  "created": {type: Date, default: Date.now()},
  "mainfile": String,
  "permissions": [
    {
      "username": String,
      "role": String
    }
  ]
});

exports.file = mongoose.model('File', {
  "project": mongoose.Schema.Types.ObjectId,
  "path": String
});

exports.dlbsjob = mongoose.model('DLBSJob', {
  "project": mongoose.Schema.Types.ObjectId,
  "jobid": String,
  "created": {type: Date, default: Date.now}
});