'use strict';

const Redis = require('redis');
const { promisify } = require('util');
const { randomBytes } = require("crypto")
const debug = require('debug')('qstream:consumer');


module.exports = (STREAM_NAME, GROUP_NAME, CONSUMER_ID, connectionArgs) => {

    const redis = Redis.createClient(...connectionArgs);
    redis.on('error', debug);
    redis.on('ready', () => {
        debug('redis ready');
    });

    const xack = promisify(redis.xack).bind(redis);
    const xreadgroup = promisify(redis.xreadgroup).bind(redis);

    const consume = async (PROCESSOR, DIRECTION = '>', BLOCK = false) => {

        const query = [
            'GROUP', GROUP_NAME, CONSUMER_ID,
            'COUNT', 1, // TODO should we process batch
            ...(BLOCK ? ['BLOCK', 0] : []), // TODO when to block for fixed time
            'STREAMS', STREAM_NAME,
            DIRECTION
        ];

        const entry = await xreadgroup(query);

        if (entry) {
            const [[STREAM, [[MSGID, [_, CONTENT]]]]] = entry;

            debug('Processing...');
            debug({ STREAM, DIRECTION, MSGID, CONTENT })

            await PROCESSOR(JSON.parse(CONTENT));

            // ack message and get next one
            debug(`Completed... ${MSGID}`);
            await xack(STREAM_NAME, GROUP_NAME, MSGID);

            await consume(PROCESSOR);
        } else {
            debug('Waiting...');
            BLOCK = true;
            await consume(PROCESSOR, DIRECTION, BLOCK);
        }
    };

    return consume;

};
