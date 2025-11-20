const { Kafka } = require('kafkajs');
const logger = require('./logger');

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'clients-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

let producer = null;

async function setupKafkaProducer() {
  try {
    producer = kafka.producer();
    await producer.connect();
    logger.info('Kafka producer connecté');
  } catch (error) {
    logger.error('Erreur connexion Kafka:', error);
    throw error;
  }
}

async function publishEvent(topic, message) {
  try {
    if (!producer) {
      throw new Error('Kafka producer non initialisé');
    }

    await producer.send({
      topic,
      messages: [
        {
          key: message.id || Date.now().toString(),
          value: JSON.stringify(message),
          timestamp: Date.now().toString()
        }
      ]
    });

    logger.info(`Événement publié sur ${topic}:`, message);
  } catch (error) {
    logger.error(`Erreur publication événement ${topic}:`, error);
    throw error;
  }
}

module.exports = {
  setupKafkaProducer,
  publishEvent
};
