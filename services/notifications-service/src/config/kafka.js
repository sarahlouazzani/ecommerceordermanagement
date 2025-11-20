const { Kafka } = require('kafkajs');
const logger = require('./logger');

const kafka = new Kafka({
  clientId: 'notifications-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')
});

async function setupKafkaConsumer(topic, handler) {
  try {
    const consumer = kafka.consumer({ groupId: `notifications-${topic}` });
    
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          logger.info(`Message reçu de ${topic}:`, data);
          await handler(data);
        } catch (error) {
          logger.error(`Erreur traitement message ${topic}:`, error);
        }
      }
    });

    logger.info(`✓ Consumer configuré pour ${topic}`);
  } catch (error) {
    logger.error(`Erreur consumer ${topic}:`, error);
    throw error;
  }
}

module.exports = { setupKafkaConsumer };
