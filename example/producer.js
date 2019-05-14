'use strict';

const QStream = require('../lib');

const qstream = QStream(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topic = 'mytopic'; // TOPIC

let counter = 0;

const complex = {
    hola: {
        text: 'world',
        lang: 'en'
    }
};

// producer
setInterval(async () => {

    const id = await qstream.publish(topic, { counter, complex });

    console.log({ counter, id });

    counter++;
}, 5000);
