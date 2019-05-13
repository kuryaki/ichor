
const Ichor = require('../lib');

const ichor = Ichor(/** Redis Connection Options see https://github.com/NodeRedis/node_redis#rediscreateclient */);

const topicName = 'mytopic'; // TOPIC
const groupName = 'mygroup'; // CONSUMER GROUP

(async () => {

    const group = await ichor.group(topicName, groupName);
    group.consume(async (data) => {
        console.log({ data });
        return true;
    });
})();
