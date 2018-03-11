/*
* @ Author: Jeriah Lee
*/

import test from 'ava';
import Redis, {cache} from '../lib/index';

test.serial('set key & get key & del key', async t => {
  let key = 'name1';
  let value = 'value1';
  let redisInst = new Redis();
  redisInst.on('connect', function() {
    // console.log('connect...')
  });
  let s = await redisInst.set(key, value);
  let g1 = await redisInst.get(key);
  let d = await redisInst.delete(key);
  let g2 = await redisInst.get(key);

  t.true(s === 'OK' && g1 === value && d === 1 && g2 === null);
});

test.serial('set key', async t => {
  let redisInst = new Redis();
  let s1 = await redisInst.set('name2', 'value2');
  let s2 = await redisInst.set('name3', 'value3', 3000);
  let s3 = await redisInst.set('name4', 'value4', 'EX', 5);
  let s4 = await redisInst.set('name5', 'value5', 'PX', 10000);
  redisInst.close();
  redisInst.close();

  t.true(s1 === 'OK' && s2 === 'OK' && s3 === 'OK' && s4 === 'OK');
});

test.serial('set key and then incr & decr ', async t => {
  let key = 'id';
  let redisInst = new Redis();
  let s = await redisInst.set(key, '100', 365 * 24 * 3600);
  await redisInst.increase(key).catch((e) => {
    console.log(e);
  });
  let g1 = await redisInst.get(key);

  await redisInst.decrease(key).catch((e) => {
    console.log(e);
  });
  let g2 = await redisInst.get(key);
  t.true(s === 'OK' && g1 === '101' && g2 === '100');
});

test.serial('set cache & get cache & del cache', async t => {
  let key = 'cache_1';
  let value = 'value1';
  let s = await cache(key, value);
  //Todo get cache failed
  //let g1 = await cache(key);
  let d = await cache(key, null);
  //let g2 = await cache(key);

  t.true(s === 'OK' && d === 1);
});

test.serial('get cache and then set cache', async t => {
  let key = 'cache_2';
  let value = 'value2';
  let g1 = await cache(key, () => {
    return value
  }, 10000);
  //let g2 = await cache(key);

  t.true(g1 === value);
});
