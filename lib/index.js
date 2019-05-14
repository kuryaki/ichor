'use strict';

const Redis = require('redis');
const { promisify } = require('util');
const { randomBytes } = require("crypto")
const debug = require('debug')('qstream');

// TODO Implement unacked logic
// const xclaim = promisify(redis.xclaim).bind(redis);
// const xpending = promisify(redis.xpending).bind(redis);

// TODO implement single/simple subscribe with no queuing/grouping
// const xread = promisify(redis.xread).bind(redis);

// TODO implement analytics
// const xinfo = promisify(redis.xinfo).bind(redis);

module.exports = (...args) => {

    const redis = Redis.createClient(...args);
    redis.on('error', debug);
    redis.on('ready', () => {
        debug('redis ready');
    });

    const xadd = promisify(redis.xadd).bind(redis);
    const xgroup = promisify(redis.xgroup).bind(redis);
    const xack = promisify(redis.xack).bind(redis);
    const xreadgroup = promisify(redis.xreadgroup).bind(redis);

    const group = async (STREAM_NAME, GROUP_NAME) => {

        if(!STREAM_NAME) throw new Error('TOPIC Required');
        if(!GROUP_NAME)  throw new Error('GROUP Required');

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
                const [[STREAM, [[MSGID, args]]]] = entry;

                // DO something with the MSG

                debug(`processing... ${STREAM}[${DIRECTION}] ${MSGID}: ${args}`);
                await PROCESSOR(args.reduce((acc, curr, i, arr) => {
                    if(i%2 === 0){
                        acc[curr] = arr[i+1];
                    } return acc;
                },{}));

                // ack message and get next one
                debug(`completed... ${MSGID}`);
                await xack(STREAM_NAME, GROUP_NAME, MSGID);

                await consume(PROCESSOR);
            } else {
                debug('waiting...');
                BLOCK = true;
                await consume(PROCESSOR, DIRECTION, BLOCK);
            }
        };

        try {


            debug(`creating group... ${GROUP_NAME}`);
            const group = await xgroup('CREATE', STREAM_NAME, GROUP_NAME, 0);
            debug(group);

        } catch (error) {
            debug(error.code);
            if (error.code !== 'BUSYGROUP') {
                throw error;
            }
        }

        const CONSUMER_ID = `${STREAM_NAME}_${GROUP_NAME}_${randomBytes(16).toString('hex')}`; // CONSUMER UUID
        debug(`creating consumer ID... ${CONSUMER_ID}`);

        return {
            consume
        };
    };


    const publish = async (STREAM_NAME, ENTRY) => {
        return await xadd([
            STREAM_NAME, '*',
            ...Object.entries(ENTRY).join().split(',')
        ]);
    };

    return {
        group,
        publish
    }

};

