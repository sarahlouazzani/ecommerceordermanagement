const { EntitySchema } = require('typeorm');

const Payment = new EntitySchema({
  name: 'Payment',
  tableName: 'payments',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    orderId: { type: 'uuid', nullable: false },
    amount: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    method: { type: 'varchar', nullable: false },
    status: { type: 'varchar', default: 'PENDING' },
    transactionId: { type: 'varchar', nullable: true },
    metadata: { type: 'jsonb', nullable: true },
    createdAt: { type: 'timestamp', createDate: true },
    updatedAt: { type: 'timestamp', updateDate: true }
  }
});

module.exports = { Payment };
