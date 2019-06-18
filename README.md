# QStream
Topic-Based Messaging Queue on top of Redis Streams


## Example

### Producer

```javascript
const streams = require('@openmessage/qstream')();

streams.publish('your-topic', data);
```

see more at [examples](/example/producer.js)

### Consumer

```javascript
const streams = require('@openmessage/qstream')();

const group = await streams.group('your-topic', 'group/queue name');

group.consume(async (data) => {
    console.log({ data });
    return true;
});

```

see more at [examples](/example/consumer.js)

## Usage

### Connection

```javascript
const QStream = require('@openmessage/qstream');
const qstream = QStream(redisUrl);
```

**redisUrl**: Valid Redis URL format

### Publish/Produce/Emit

```javascript
qstream.publish('your-topic', data);
```

**data**: can be any valid javascript object, primitive values not supported

### Consumer Group

```javascript
const group = await streams.group('your-topic', 'consumer-group/queue-name');
```

Consumers in the same consumer group will load balance jobs among them


### Subscrie/Consume/Listen

```javascript
group.consume(async (data) => {
    console.log({ data });
    return true;
});
```

The function passed to the consume method can be a promise

```javascript
group.consume(console.log, 10);
```

as a second parameter to the consume function it receives the number of concurrent jobs, defaults to 1


### Debug

This lib uses [debug](https://www.npmjs.com/package/debug) to debug the processing

```bash
DEBUG=qstream:* npm start
```


## Roadmap

- [x] Add proper logging debug?
- [ ] Add linting
- [ ] Add Tests
- [ ] Add CI / CD
- [ ] Handle unacked messages (CLAIM, PENDING)
- [ ] Add pub/sub case (fanout)
- [ ] Add timeline case
- [ ] Improve docs
