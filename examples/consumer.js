
const QStream = require('../lib');

const qstream = QStream(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topicName = 'mytopic'; // TOPIC
const groupName = 'mygroup'; // CONSUMER GROUP

(async () => {

    const group = await qstream.group(topicName, groupName);
    group.consume(async (data) => {
        console.log(data);
        return true;
    });
})();
