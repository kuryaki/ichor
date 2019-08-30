
const QStream = require('../lib');

const qstream = QStream(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topicName = 'mytopic'; // TOPIC
const groupName = 'agroup3'; // CONSUMER GROUP

(async () => {

    const group = await qstream.group(topicName, groupName);
    group.consume(async (data, id) => {

        console.log(data, id);
        return true;
    }, 10).catch(console.error);
})();
