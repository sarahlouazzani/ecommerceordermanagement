const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./config/database');
const logger = require('./config/logger');
const productRoutes = require('./routes/product.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { setupKafkaProducer } = require('./config/kafka');

const app = express();
const PORT = process.env.SERVICE_PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'products-service',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ Connexion à PostgreSQL établie');

    await setupKafkaProducer();
    logger.info('✓ Kafka producer configuré');

    app.listen(PORT, () => {
      logger.info(`🚀 Products Service démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage:', error);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGTERM', async () => {
  await AppDataSource.destroy();
  process.exit(0);
});
