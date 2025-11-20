const { Kafka } = require('kafkajs');
const logger = require('./logger');

const kafka = new Kafka({
  clientId: 'products-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

let producer = null;

async function setupKafkaProducer() {
  try {
    producer = kafka.producer();
    await producer.connect();
  } catch (error) {
    logger.error('Erreur Kafka:', error);
  }
}

async function publishEvent(topic, message) {
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    });
  } catch (error) {
    logger.error('Erreur publication:', error);
  }
}

module.exports = { setupKafkaProducer, publishEvent };
