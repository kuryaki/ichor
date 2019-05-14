'use strict';

const Redis = require('redis');
const { randomBytes } = require("crypto")
const debug = require('debug')('qstream:main');

const publisher = require('./publisher');
const grouper = require('./grouper');

// TODO Implement unacked logic
// const xclaim = promisify(redis.xclaim).bind(redis);
// const xpending = promisify(redis.xpending).bind(redis);

// TODO implement single/simple subscribe with no queuing/grouping
// const xread = promisify(redis.xread).bind(redis);

// TODO implement analytics
// const xinfo = promisify(redis.xinfo).bind(redis);

module.exports = (...connectionArgs) => {

    const redis = Redis.createClient(...connectionArgs);
    redis.on('error', debug);
    redis.on('ready', () => {
        debug('redis ready');
    });

    const publish = publisher(redis);
    const group = grouper(redis, connectionArgs);

    return {
        group,
        publish
    }

};

