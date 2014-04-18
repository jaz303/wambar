var utils = require('audio-buffer-utils');

exports.createSession   = require('./lib/session');
exports.cloneBuffer     = utils.clone;
exports.reverseBuffer   = utils.reverse;
exports.invertBuffer    = utils.invert;
exports.zeroBuffer      = utils.zero;
