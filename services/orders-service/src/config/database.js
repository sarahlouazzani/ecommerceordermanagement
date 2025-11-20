const { DataSource } = require('typeorm');
const { Order } = require('../entities/Order');
const { OrderItem } = require('../entities/OrderItem');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT) || 55432,
  username: process.env.POSTGRES_USER || 'ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'ecommerce123',
  database: process.env.POSTGRES_DB || 'ecommerce',
  schema: 'orders',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [Order, OrderItem]
});

module.exports = { AppDataSource };
