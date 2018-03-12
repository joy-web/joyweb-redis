/*
 * @ Author: Jeriah Lee
 * @ Desc: A Redis Cache Lib
 */
import assert from 'assert';
import Redis from './redis';
import Debounce from './debounce';

const debounceInstance = new Debounce();

const defaultConfig = {
  port: 6379,
  host: '127.0.0.1',
  password: '',
  timeout: 24 * 3600 * 1000
};


/**
 * redis cache adapter
 */
export default class RedisCache {

  constructor(config = {}) {
    this.redis = new Redis({
      ...defaultConfig,
      ...config
    });
    this.timeout = config.timeout;
  }

  /**
   * get cache content by the cache key
   * @param  {String} key [description]
   * @return {Promise}      [description]
   */
  get(key) {
    return this.redis.get(key).then((data) => {
      if (data === null) return (void 0);
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
  set(key, content, timeout = this.timeout) {
    content = JSON.stringify(content);
    return this.redis.set(key, content, timeout);
  }

  /**
   * delete cache key
   * @param  {String} key [description]
   * @return {Promise}     [description]
   */
  delete(key) {
    return this.redis.delete(key);
  }
}

/**
 * cache manage
 * @param {String} name
 * @param {Mixed} value
 * @param {String|Object} config
 */
export const cache = (name, value, config) => {

  assert(name && typeof name === 'string', 'cache.name must be a string');

  const cacheInstance = new RedisCache({
    ...defaultConfig,
    ...config
  });

  // delete cache
  if (value === null) {
    return Promise.resolve(cacheInstance.delete(name));
  }

  // get cache
  if (value === undefined) {
    return debounceInstance.debounce(name, () => {
      return cacheInstance.get(name);
    });
  }

  // get cache when value is function
  if (typeof value === 'function') {
    return debounceInstance.debounce(name, () => {
      let cacheData;
      return cacheInstance.get(name).then(data => {
        if (data === undefined) {
          return value(name);
        }
        cacheData = data;
      }).then(data => {
        if (data !== undefined) {
          cacheData = data;
          return cacheInstance.set(name, data);
        }
      }).then(() => {
        return cacheData;
      });
    });
  }

  // set cache
  return Promise.resolve(cacheInstance.set(name, value));
};
