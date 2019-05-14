'use strict';

const QStream = require('../lib');

const qstream = QStream(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topic = 'countstream'; // TOPIC

let counter = 0;

// producer
setInterval(async () => {

    const id = await qstream.publish(topic, { counter });

    console.log({ counter, id });

    counter++;
}, 1000);
