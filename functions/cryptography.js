var base58 = require('base58-native');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

exports.createToken = function(length) {
  return base58.encode(crypto.randomBytes(length));
};

exports.calculateHash = function(password, salt){
  if(salt) {
    return bcrypt.hashSync(password, salt);
  } else {
    var newSalt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, newSalt);
  }
};

exports.checkPassword = function(password, hash) {
  return bcrypt.compareSync(password, hash);
};
