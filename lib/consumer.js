'use strict';

const { promisify } = require('util');
const { hostname } = require('os');

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

const STREAM_NAME = 'countstream'; // TOPIC
const GROUP_NAME = 'countstream-printing'; // CONSUMER
const CONSUMER_ID = `consumerid:${hostname()}`; // CONSUMER NODE
const CONCURRENT_JOBS = 1;
const TIMEOUT = 2000;


const processPending = async (DIRECTION='>', BLOCK=false) => {

    let entry = null;
    const processTime = Math.floor(Math.random()*10000);

    if(BLOCK){
        console.log('waiting');
        entry = await xreadgroup('GROUP', GROUP_NAME, CONSUMER_ID, 'COUNT', CONCURRENT_JOBS, 'BLOCK', 3000, 'STREAMS', STREAM_NAME, DIRECTION);
    } else {
        console.log('polling');
        entry = await xreadgroup('GROUP', GROUP_NAME, CONSUMER_ID, 'COUNT', CONCURRENT_JOBS, 'STREAMS', STREAM_NAME, DIRECTION);
    }

    if (entry) {
        const [[stream, [MSG]]] = entry;

        if (MSG) {
            const [MSGID, args] = MSG;

            // DO something with the MSG

            console.log(`${stream}[${DIRECTION}] ${MSGID}: ${args}`);

            setTimeout(async () => {
                console.log('waiting...', processTime);

                // ack message and get next one
                await xack(STREAM_NAME, GROUP_NAME, MSGID);
                processPending(DIRECTION);
            }, processTime);

        } else {
            processPending('>', true);
        }
    } else {
        console.log('checking for unacked');
        processPending('0');
    }
}

// consumer
(async () => {

    try {
        await xgroup('CREATE', STREAM_NAME, GROUP_NAME, 0);
        // TODO will fail if stream does not exist already
    } catch (error) {
        if (error.code !== 'BUSYGROUP') {
            throw error;
        }
    }

    await processPending();

})();
