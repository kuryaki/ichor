'use strict';

const Ichor = require('../lib');

const ichor = Ichor(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topic = 'countstream'; // TOPIC

let counter = 0;

// producer
setInterval(async () => {

    const id = await ichor.publish(topic, { counter });

    console.log({ counter, id });

    counter++;
}, 1000);
