const { EventEmitter } = require('events');

// A thin wrapper around Node's EventEmitter. Kept as its own module (rather
// than importing 'events' directly everywhere) so this is the one place we'd
// swap in a real message queue (SQS/RabbitMQ) for a multi-instance deployment
// without touching every publisher/handler.
class EventBus extends EventEmitter {}

const bus = new EventBus();

// Every handler runs async and independently; one handler throwing must not
// break others or the request that published the event.
bus.on('error', (err) => console.error('EventBus handler error:', err));

module.exports = bus;
