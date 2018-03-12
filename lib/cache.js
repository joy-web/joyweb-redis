'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cache = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @ Author: Jeriah Lee
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @ Desc: A Redis Cache Lib
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _redis = require('./redis');

var _redis2 = _interopRequireDefault(_redis);

var _debounce = require('./debounce');

var _debounce2 = _interopRequireDefault(_debounce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debounceInstance = new _debounce2.default();

var defaultConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: '',
  timeout: 24 * 3600 * 1000
};

/**
 * redis cache adapter
 */

var RedisCache = function () {
  function RedisCache() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RedisCache);

    this.redis = new _redis2.default(_extends({}, defaultConfig, config));
    this.timeout = config.timeout;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */


  _createClass(RedisCache, [{
    key: 'get',
    value: function get(key) {
      return this.redis.get(key).then(function (data) {
        if (data === null) return void 0;
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      });
    }

    /**
     * get cache key's content
     * @param {String} key     [description]
     * @param {String} content [description]
     * @param {Number} timeout [millisecond]
     * @return {Promise}      [description]
     */

  }, {
    key: 'set',
    value: function set(key, content) {
      var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.timeout;

      content = JSON.stringify(content);
      return this.redis.set(key, content, timeout);
    }

    /**
     * delete cache key
     * @param  {String} key [description]
     * @return {Promise}     [description]
     */

  }, {
    key: 'delete',
    value: function _delete(key) {
      return this.redis.delete(key);
    }
  }]);

  return RedisCache;
}();

/**
 * cache manage
 * @param {String} name
 * @param {Mixed} value
 * @param {String|Object} config
 */


exports.default = RedisCache;
var cache = exports.cache = function cache(name, value, config) {

  (0, _assert2.default)(name && typeof name === 'string', 'cache.name must be a string');

  var cacheInstance = new RedisCache(_extends({}, defaultConfig, config));

  // delete cache
  if (value === null) {
    return Promise.resolve(cacheInstance.delete(name));
  }

  // get cache
  if (value === undefined) {
    return debounceInstance.debounce(name, function () {
      return cacheInstance.get(name);
    });
  }

  // get cache when value is function
  if (typeof value === 'function') {
    return debounceInstance.debounce(name, function () {
      var cacheData = void 0;
      return cacheInstance.get(name).then(function (data) {
        if (data === undefined) {
          return value(name);
        }
        cacheData = data;
      }).then(function (data) {
        if (data !== undefined) {
          cacheData = data;
          return cacheInstance.set(name, data);
        }
      }).then(function () {
        return cacheData;
      });
    });
  }

  // set cache
  return Promise.resolve(cacheInstance.set(name, value));
};