const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./config/database');
const logger = require('./config/logger');
const clientRoutes = require('./routes/client.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { setupKafkaProducer } = require('./config/kafka');

const app = express();
const PORT = process.env.SERVICE_PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/clients', clientRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'clients-service',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Initialisation
async function bootstrap() {
  try {
    // Connexion à la base de données
    await AppDataSource.initialize();
    logger.info('✓ Connexion à PostgreSQL établie');

    // Configuration Kafka
    await setupKafkaProducer();
    logger.info('✓ Kafka producer configuré');

    // Démarrage du serveur
    app.listen(PORT, () => {
      logger.info(`🚀 Clients Service démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

bootstrap();

// Gestion des signaux
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu, fermeture...');
  await AppDataSource.destroy();
  process.exit(0);
});
