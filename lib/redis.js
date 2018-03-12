'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @ Author: Jeriah Lee
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @ Desc: A Redis Lib for CURD created by ioredis
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ioredis = require('ioredis');

var _ioredis2 = _interopRequireDefault(_ioredis);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _debounce = require('./debounce');

var _debounce2 = _interopRequireDefault(_debounce);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debounceInstance = new _debounce2.default();
var _validExpire = Symbol('validExpire');
var _getConnection = Symbol('_getConnection');
var cacheConn = {};

// redis config see at https://github.com/luin/ioredis/blob/master/lib/redis.js
var defaultConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: ''
};

var Redis = function () {
  function Redis(config) {
    _classCallCheck(this, Redis);

    this.redis = this[_getConnection](_extends({}, defaultConfig, config));
  }

  /**
   * getConnection by config
   * @param  {Object} config [description]
   * @return {Object}        [description]
   */


  _createClass(Redis, [{
    key: _getConnection,
    value: function value(config) {
      delete config.cookie;
      var md5 = _crypto2.default.createHash('md5').update('' + JSON.stringify(config), 'utf8').digest('hex');
      if (!cacheConn[md5] || !cacheConn[md5].connector.connecting) {
        //console.info(config, '-->', md5)
        cacheConn[md5] = new _ioredis2.default(config);
      }
      return cacheConn[md5];
    }

    /**
     * valid expire num
     */

  }, {
    key: _validExpire,
    value: function value(num) {
      var msg = 'expire should be an integer great than zero';
      (0, _assert2.default)(num && /^[+]?[0-9]+$/.test(num) && num > 0, msg);
    }

    /**
     * add event listener
     * @param  {String}   event  [connect,ready,error,close,reconnecting,end is supported]
     * @param  {Function} callback [description]
     * @return {void}            [description]
     */

  }, {
    key: 'on',
    value: function on(event, callback) {
      this.redis.on(event, callback);
    }

    /**
     * set key
     * @param {Stirng} key    [description]
     * @param {String} value  [description]
     * @param {String} type   [EX='seconds'|PX='milliseconds']
     * @param {Int} expire    [>0]
     * @return {Promise}      [description]
     */

  }, {
    key: 'set',
    value: function set(key, value, type, expire) {
      if (type) {
        if (typeof type === 'string') {
          (0, _assert2.default)(type === 'EX' || type === 'PX', 'type should eq "EX" or "PX"');
          this[_validExpire](expire);
          return this.redis.set(key, value, type, expire);
        }
        this[_validExpire](type);
        return this.redis.set(key, value, 'PX', type);
      }
      // without type
      return this.redis.set(key, value);
    }

    /**
     * get key
     * @param  {String} key [description]
     * @return {Promise}     [description]
     */

  }, {
    key: 'get',
    value: function get(key) {
      var _this = this;

      return debounceInstance.debounce(key, function () {
        return _this.redis.get(key);
      });
    }

    /**
     * delete key
     * @param  {String} key [description]
     * @return {Promise}     [description]
     */

  }, {
    key: 'delete',
    value: function _delete(key) {
      return this.redis.del(key);
    }

    /**
     * increase key's value
     * @param  {String} key [description]
     * @return {Promise}     [description]
     */

  }, {
    key: 'increase',
    value: function increase(key) {
      return this.redis.incr(key);
    }

    /**
     * decrease key's value
     * @param  {String} key [description]
     * @return {Promise}     [description]
     */

  }, {
    key: 'decrease',
    value: function decrease(key) {
      return this.redis.decr(key);
    }

    /**
     * close connection
     * @return {void} [description]
     */

  }, {
    key: 'close',
    value: function close() {
      if (this.redis.connector.connecting) {
        this.redis.disconnect();
      }
    }
  }]);

  return Redis;
}();

exports.default = Redis;