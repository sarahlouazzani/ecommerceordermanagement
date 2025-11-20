const { EntitySchema } = require('typeorm');

const Product = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      nullable: false
    },
    description: {
      type: 'text',
      nullable: true
    },
    price: {
      type: 'decimal',
      precision: 10,
      scale: 2,
      nullable: false
    },
    stock: {
      type: 'int',
      default: 0
    },
    category: {
      type: 'varchar',
      nullable: false
    },
    images: {
      type: 'jsonb',
      nullable: true
    },
    attributes: {
      type: 'jsonb',
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true
    },
    updatedAt: {
      type: 'timestamp',
      updateDate: true
    }
  },
  indices: [
    {
      name: 'IDX_PRODUCT_CATEGORY',
      columns: ['category']
    }
  ]
});

module.exports = { Product };
