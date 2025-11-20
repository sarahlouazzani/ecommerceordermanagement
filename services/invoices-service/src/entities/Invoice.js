const { EntitySchema } = require('typeorm');

const Invoice = new EntitySchema({
  name: 'Invoice',
  tableName: 'invoices',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    invoiceNumber: { type: 'varchar', unique: true, nullable: false },
    orderId: { type: 'uuid', nullable: false },
    clientId: { type: 'uuid', nullable: false },
    total: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    tax: { type: 'decimal', precision: 10, scale: 2, default: 0 },
    subtotal: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    status: { type: 'varchar', default: 'DRAFT' },
    pdfUrl: { type: 'varchar', nullable: true },
    createdAt: { type: 'timestamp', createDate: true }
  }
});

module.exports = { Invoice };
