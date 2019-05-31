'use strict';

const { promisify } = require('util');
const debug = require('debug')('qstream:publisher');

module.exports = (redis) => {

    const xadd = promisify(redis.xadd).bind(redis);

    const publish = async (STREAM_NAME, ENTRY=null) => {

        if(!ENTRY) {
            throw new Error('Publish need a topic and an entry, publish("topic", "entry")');
        }

        debug('Publishing....', ENTRY);

        return await xadd([
            STREAM_NAME, '*',
            'ENTRY', JSON.stringify(ENTRY)
        ]);
    };

    return publish;
};
