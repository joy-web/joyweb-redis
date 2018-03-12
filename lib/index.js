'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cache = undefined;

var _redis = require('./redis');

var _redis2 = _interopRequireDefault(_redis);

var _cache = require('./cache');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.cache = _cache.cache;
exports.default = _redis2.default;