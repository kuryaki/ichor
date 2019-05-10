'use strict';

const { promisify } = require('util');

const Redis = require('redis');
const redis = Redis.createClient();

redis.on('error', console.error);

const xadd = promisify(redis.xadd).bind(redis);
const xread = promisify(redis.xread).bind(redis);
const xinfo = promisify(redis.xinfo).bind(redis);
const xgroup = promisify(redis.xgroup).bind(redis);
const xpending = promisify(redis.xpending).bind(redis);
const xack = promisify(redis.xack).bind(redis);
const xreadgroup = promisify(redis.xreadgroup).bind(redis);

const STREAM_NAME = 'mystream';

// consumer
(async () => {

    const [[stream, val]] = await xread('BLOCK', 5000, 'STREAMS', STREAM_NAME, '$').catch(console.error);
    console.log(`${stream}: Hello ${val}`);
})();
