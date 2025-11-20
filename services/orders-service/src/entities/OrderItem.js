const { EntitySchema } = require('typeorm');

const OrderItem = new EntitySchema({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    productId: { type: 'uuid', nullable: false },
    quantity: { type: 'int', nullable: false },
    price: { type: 'decimal', precision: 10, scale: 2, nullable: false },
    total: { type: 'decimal', precision: 10, scale: 2, nullable: false }
  },
  relations: {
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: { name: 'orderId' },
      onDelete: 'CASCADE'
    }
  }
});

module.exports = { OrderItem };
