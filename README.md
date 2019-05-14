# QStream
Topic-Based Messaging Queue on top of Redis Streams


## usage:

### Producer

```
const streams = require('redis-streams-topic-queue')();

streams.publish('your-topic', data);
```

see more at [examples](/example/producer.js)

### Consumer

```
const streams = require('redis-streams-topic-queue')();

const group = await streams.group('your-topic', 'group/queue name');

group.consume(async (data) => {
    console.log({ data });
    return true;
});

```

see more at [examples](/example/consumer.js)


## Roadmap

- [x] Add proper logging debug?
- [ ] Handle unacked messages (CLAIM, PENDING)
- [ ] Add linting
- [ ] Add Tests
- [ ] Add CI / CD (gtihub publishing)
