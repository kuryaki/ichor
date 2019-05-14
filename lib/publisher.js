'use strict';

const { promisify } = require('util');
const debug = require('debug')('qstream:publisher');

module.exports = (redis) => {

    const xadd = promisify(redis.xadd).bind(redis);

    const publish = async (STREAM_NAME, ENTRY) => {

        const ENTRIES = Object.entries(ENTRY)
            .map(([key, val]) => [key, JSON.stringify(val)])
            .reduce((acc, arr) => acc.concat(arr), []);


        debug('Publishing....', ENTRIES);

        return await xadd([
            STREAM_NAME, '*',
            ...ENTRIES
        ]);
    };

    return publish;
};
