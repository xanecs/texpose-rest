var mongoose = require('mongoose');

exports.user = mongoose.model('User', {
  "username": String,
  "email": String,
  "firstname": String,
  "lastname": String,
  "registered": {type: Date, default: Date.now()},
  "hash": String,
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
  "token": String,
  "username": String,
  "lastuse": Date,
  "ip": String
});