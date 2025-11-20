const { Kafka } = require('kafkajs');
const logger = require('./logger');

const kafka = new Kafka({
  clientId: 'orders-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

let producer = null;

async function setupKafka() {
  producer = kafka.producer();
  await producer.connect();
}

async function publishEvent(topic, message) {
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }]
  });
}

module.exports = { setupKafka, publishEvent };
