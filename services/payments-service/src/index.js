const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./config/database');
const logger = require('./config/logger');
const paymentRoutes = require('./routes/payment.routes');
const { setupKafka } = require('./config/kafka');

const app = express();
const PORT = process.env.SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());
app.use('/api/payments', paymentRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'payments-service' }));

async function bootstrap() {
  await AppDataSource.initialize();
  await setupKafka();
  app.listen(PORT, () => logger.info(`🚀 Payments Service sur http://localhost:${PORT}`));
}

bootstrap();
