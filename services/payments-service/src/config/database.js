const { DataSource } = require('typeorm');
const { Payment } = require('../entities/Payment');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 55432,
  username: process.env.POSTGRES_USER || 'ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'ecommerce123',
  database: process.env.POSTGRES_DB || 'ecommerce',
  schema: 'payments',
  synchronize: process.env.NODE_ENV !== 'production',
  entities: [Payment]
});

module.exports = { AppDataSource };
