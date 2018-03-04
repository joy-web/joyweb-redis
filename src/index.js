/*
 * @ Author: Jeriah Lee
 * @ Desc: A Redis Lib for CURD created by ioredis
 */
import assert from 'assert';
import IOredis from 'ioredis';
import crypto from 'crypto';
import Debounce from './debounce';

const debounceInstance = new Debounce();
const _validExpire = Symbol('validExpire');
const _getConnection = Symbol('_getConnection');
const cacheConn = {};

// redis config see at https://github.com/luin/ioredis/blob/master/lib/redis.js
const defaultConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: ''
};

export default class Redis {
  constructor(config) {
    this.redis = this[_getConnection]({
      ...defaultConfig,
      ...config
    });
  }

  /**
   * getConnection by config
   * @param  {Object} config [description]
   * @return {Object}        [description]
   */
  [_getConnection](config) {
    delete config.cookie;
    const md5 = crypto.createHash('md5').update(`${JSON.stringify(config)}`, 'utf8').digest('hex');
    if (!cacheConn[md5] || !cacheConn[md5].connector.connecting) {
      //console.info(config, '-->', md5)
      cacheConn[md5] = new IOredis(config);
    }
    return cacheConn[md5];
  }

  /**
   * valid expire num
   */
  [_validExpire](num) {
    const msg = 'expire should be an integer great than zero';
    assert(num && (/^[+]?[0-9]+$/).test(num) && num > 0, msg);
  }

  /**
   * add event listener
   * @param  {String}   event  [connect,ready,error,close,reconnecting,end is supported]
   * @param  {Function} callback [description]
   * @return {void}            [description]
   */
  on(event, callback) {
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
  set(key, value, type, expire) {
    if (type) {
      if (typeof type === 'string') {
        assert(type === 'EX' || type === 'PX', 'type should eq "EX" or "PX"');
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
  get(key) {
    return debounceInstance.debounce(key, () => this.redis.get(key));
  }

  /**
   * delete key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.redis.del(key);
  }

  /**
   * increase key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  increase(key) {
    return this.redis.incr(key);
  }

  /**
   * decrease key's value
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  decrease(key) {
    return this.redis.decr(key);
  }

  /**
   * close connection
   * @return {void} [description]
   */
  close() {
    if (this.redis.connector.connecting) {
      this.redis.disconnect();
    }
  }
}
