const { EntitySchema } = require('typeorm');

const Order = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    orderNumber: { type: 'varchar', unique: true, nullable: false },
    clientId: { type: 'uuid', nullable: false },
    status: { type: 'varchar', default: 'PENDING' },
    total: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    shippingAddress: { type: 'jsonb', nullable: false },
    paymentId: { type: 'uuid', nullable: true },
    invoiceId: { type: 'uuid', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true }
  },
  relations: {
    items: {
      type: 'one-to-many',
      target: 'OrderItem',
      inverseSide: 'order',
      cascade: true
    }
  }
});

module.exports = { Order };
