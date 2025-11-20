const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const express = require('express');
const cors = require('cors');
const { AppDataSource } = require('./config/database');
const logger = require('./config/logger');
const invoiceRoutes = require('./routes/invoice.routes');
const { setupKafka } = require('./config/kafka');

const app = express();
const PORT = process.env.SERVICE_PORT || 3005;

app.use(cors());
app.use(express.json());
app.use('/api/invoices', invoiceRoutes);
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'invoices-service' }));

async function bootstrap() {
  await AppDataSource.initialize();
  await setupKafka();
  app.listen(PORT, () => logger.info(`🚀 Invoices Service sur http://localhost:${PORT}`));
}

bootstrap();
