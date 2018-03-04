# joyweb-redis

## Install

```
npm install joyweb-redis
```

## How to Use

### default options

You can find all the config options at https://github.com/luin/ioredis/blob/master/lib/redis.js

```js
const defaultConfig = {
  port: 6379,          // Redis port
  host: '127.0.0.1',   // Redis host
  password: '',
};
```

### usage

```js
import Redis from '../index';

let redisInst = new Redis(config);

// set key
let s1 = await redisInst.set('name2', 'value'); // never expire
let s2 = await redisInst.set('name3', 'value', 3000); // milliseconds
let s3 = await redisInst.set('name4', 'value', 'EX', 5); //seconds
let s4 = await redisInst.set('name5', 'value', 'PX', 10000); //milliseconds

// get key's value
let g1 = await redisInst.get('name2');

// delete key
let d1 = await redisInst.delete(key);

// add event listener, supported events see at https://github.com/luin/ioredis
redisInst.on('connect', function() {
  // todo
});

// increase 1, if key not exist, set key's value eq 0 and then increase 1
await redisInst.increase(key);

// decrease 1, if key not exist, set key's value eq 0 then decrease 1
await redisInst.decrease(key);

```
