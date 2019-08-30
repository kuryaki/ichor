'use strict';

const { promisify } = require('util');
const { randomBytes } = require('crypto')
const debug = require('debug')('qstream:grouper');

const consumer = require('./consumer');

module.exports = (redis, connectionArgs) => {

    const xgroup = promisify(redis.xgroup).bind(redis);

    const group = async (STREAM_NAME, GROUP_NAME, START_AT='$') => {

        if(!STREAM_NAME) throw new Error('TOPIC Name Required');
        if(!GROUP_NAME)  throw new Error('GROUP Name Required');

        try {
            debug('Creating group... ', { GROUP_NAME, STREAM_NAME });
            const group = await xgroup('CREATE', STREAM_NAME, GROUP_NAME + START_AT, START_AT, 'MKSTREAM');
            debug(group);
        } catch (error) {
            debug(error.code);
            if (error.code !== 'BUSYGROUP') {
                throw error;
            }
        }

        const CONSUMER_ID = `${STREAM_NAME}_${GROUP_NAME}_${randomBytes(16).toString('hex')}`; // CONSUMER UUID
        debug('Creating consumer ID...', { CONSUMER_ID });

        const consume = consumer(STREAM_NAME, GROUP_NAME + START_AT, CONSUMER_ID, connectionArgs);

        return {
            consume
        }
    };

    return group;
};
