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
}, 1000);


//consumer
const topicName = 'mytopic'; // TOPIC
const groupName = 'mygroup'; // CONSUMER GROUP

(async () => {

    const group = await qstream.group(topicName, groupName);
    group.consume(async (data) => {
        console.log(data);
        return true;
    });
})();

