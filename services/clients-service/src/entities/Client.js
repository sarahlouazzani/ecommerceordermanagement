const { EntitySchema } = require('typeorm');

const Client = new EntitySchema({
  name: 'Client',
  tableName: 'clients',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid'
    },
    email: {
      type: 'varchar',
      unique: true,
      nullable: false
    },
    password: {
      type: 'varchar',
      nullable: false
    },
    firstName: {
      type: 'varchar',
      nullable: false
    },
    lastName: {
      type: 'varchar',
      nullable: false
    },
    phone: {
      type: 'varchar',
      nullable: true
    },
    role: {
      type: 'varchar',
      default: 'client'
    },
    address: {
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
      name: 'IDX_CLIENT_EMAIL',
      columns: ['email']
    }
  ]
});

module.exports = { Client };
