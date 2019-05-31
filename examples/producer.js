'use strict';

const QStream = require('../lib');

const qstream = QStream(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topic = 'mytopic'; // TOPIC

let counter = 0;

const complex = {
    hola: {
        text: 'world',
        lang: undefined
    }
};

// producer
setInterval(async () => {

    const id = await qstream.publish(topic, { counter, complex }).catch(console.error);

    console.log({ counter, id });

    counter++;
}, 1000);
