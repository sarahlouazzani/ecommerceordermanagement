const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');
const { setupKafkaConsumer } = require('./config/kafka');
const { sendEmail } = require('./services/email.service');

const app = express();
const PORT = process.env.SERVICE_PORT || 3006;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notifications-service' });
});

// Démarrage
async function bootstrap() {
  try {
    // Configurer les consumers Kafka
    await setupKafkaConsumer('client.created', async (message) => {
      logger.info('Événement client.created reçu:', message);
      await sendEmail(message.email, 'Bienvenue', `Bonjour ${message.firstName}, bienvenue sur notre plateforme!`);
    });

    await setupKafkaConsumer('order.created', async (message) => {
      logger.info('Événement order.created reçu:', message);
      // Envoyer email de confirmation de commande
    });

    await setupKafkaConsumer('payment.processed', async (message) => {
      logger.info('Événement payment.processed reçu:', message);
      // Envoyer email de confirmation de paiement
    });

    await setupKafkaConsumer('invoice.generated', async (message) => {
      logger.info('Événement invoice.generated reçu:', message);
      // Envoyer email avec facture
    });

    app.listen(PORT, () => {
      logger.info(`🚀 Notifications Service sur http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur démarrage:', error);
    process.exit(1);
  }
}

bootstrap();
