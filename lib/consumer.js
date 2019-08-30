'use strict';

const Redis = require('redis');
const { promisify } = require('util');
const debug = require('debug')('qstream:consumer');


module.exports = (STREAM_NAME, GROUP_NAME, CONSUMER_ID, connectionArgs) => {

    const redis = Redis.createClient(...connectionArgs);
    redis.on('error', debug);
    redis.on('ready', () => {
        debug('redis ready');
    });

    const xack = promisify(redis.xack).bind(redis);
    const xreadgroup = promisify(redis.xreadgroup).bind(redis);

    const consume = async (PROCESSOR, COUNT = 1, DIRECTION = '>', BLOCK = false) => {

        const query = [
            'GROUP', GROUP_NAME, CONSUMER_ID,
            'COUNT', COUNT,
            ...(BLOCK ? ['BLOCK', 0] : []), // TODO when to block for fixed time
            'STREAMS', STREAM_NAME,
            DIRECTION
        ];

        const DATA = await xreadgroup(query);

        if (DATA) {
            const [[STREAM, ENTRIES]] = DATA;

            debug('Processing...');
            debug({ STREAM, DIRECTION })

            const JOBS = ENTRIES.map(async ([ID, [_, CONTENT]]) => {

                debug({ ID, CONTENT });
                await PROCESSOR(JSON.parse(CONTENT), ID);
                await xack(STREAM_NAME, GROUP_NAME, ID);

                return ID;
            });

            const PROCESSED = await Promise.all(JOBS);

            debug('Completed...', PROCESSED)

            await consume(PROCESSOR, COUNT, DIRECTION, BLOCK);
        } else {
            debug('Waiting...');
            BLOCK = true;
            await consume(PROCESSOR, COUNT, DIRECTION, BLOCK);
        }
    };

    return consume;

};
