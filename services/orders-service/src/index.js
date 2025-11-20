const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./config/database');
const logger = require('./config/logger');
const orderRoutes = require('./routes/order.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const { setupKafka } = require('./config/kafka');

const app = express();
const PORT = process.env.SERVICE_PORT || 3003;

app.use(cors());
app.use(express.json());
app.use('/api/orders', orderRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'orders-service', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    logger.info('✓ Connexion PostgreSQL');
    await setupKafka();
    logger.info('✓ Kafka configuré');
    app.listen(PORT, () => {
      logger.info(`🚀 Orders Service sur http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Erreur démarrage:', error);
    process.exit(1);
  }
}

bootstrap();
