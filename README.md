# ichor
Topic-Based Messaging Queue on top of Redis Streams


## usage:

### Producer

```
const ichor = require('ichor')();

ichor.publish('your-topic', data);
```

see more at [examples](/example/producer.js);

### Consumer

```
const ichor = require('ichor')();

await ichor.group('your-topic', 'group/queue name');

group.consume(async (data) => {
    console.log({ data });
    return true;
});

```

see more at [examples](/example/consumer.js);


## Roadmap

- [x] Add proper logging debug?
- [ ] Handle unacked messages (CLAIM, PENDING)
- [ ] Add linting
- [ ] Add Tests
- [ ] Add CI / CD (gtihub publishing)
