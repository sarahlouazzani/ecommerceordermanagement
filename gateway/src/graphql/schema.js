const gql = require('graphql-tag');

const typeDefs = gql`
  # Scalaires personnalisés
  scalar DateTime
  scalar JSON

  # Types de base
  type Query {
    # Health check
    ping: String!
    
    # Clients
    client(id: ID!): Client
    clients(limit: Int, offset: Int): [Client!]!
    
    # Produits
    product(id: ID!): Product
    products(limit: Int, offset: Int, category: String): [Product!]!
    
    # Commandes
    order(id: ID!): Order
    orders(clientId: ID, status: OrderStatus): [Order!]!
    myOrders: [Order!]!
    
    # Paiements
    payment(id: ID!): Payment
    
    # Factures
    invoice(id: ID!): Invoice
    invoices(clientId: ID): [Invoice!]!
  }

  type Mutation {
    # Clients
    createClient(input: CreateClientInput!): Client!
    updateClient(id: ID!, input: UpdateClientInput!): Client!
    deleteClient(id: ID!): Boolean!
    
    # Produits
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!
    updateStock(id: ID!, quantity: Int!): Product!
    
    # Commandes
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    cancelOrder(id: ID!): Order!
    
    # Paiements
    processPayment(input: ProcessPaymentInput!): Payment!
    refundPayment(id: ID!): Payment!
    
    # Factures
    generateInvoice(orderId: ID!): Invoice!
  }

  type Subscription {
    orderStatusChanged(orderId: ID!): Order!
    paymentProcessed(orderId: ID!): Payment!
  }

  # Types Client
  type Client {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phone: String
    address: Address
    createdAt: DateTime!
    updatedAt: DateTime!
    orders: [Order!]
  }

  type Address {
    street: String!
    city: String!
    postalCode: String!
    country: String!
  }

  input CreateClientInput {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
    phone: String
    address: AddressInput
  }

  input UpdateClientInput {
    email: String
    firstName: String
    lastName: String
    phone: String
    address: AddressInput
  }

  input AddressInput {
    street: String!
    city: String!
    postalCode: String!
    country: String!
  }

  # Types Produit
  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    stock: Int!
    category: String!
    images: [String!]
    attributes: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    stock: Int!
    category: String!
    images: [String!]
    attributes: JSON
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    stock: Int
    category: String
    images: [String!]
    attributes: JSON
  }

  # Types Commande
  type Order {
    id: ID!
    orderNumber: String!
    client: Client!
    items: [OrderItem!]!
    status: OrderStatus!
    total: Float!
    shippingAddress: Address!
    payment: Payment
    invoice: Invoice
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    price: Float!
    total: Float!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  input CreateOrderInput {
    clientId: ID!
    items: [OrderItemInput!]!
    shippingAddress: AddressInput!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  # Types Paiement
  type Payment {
    id: ID!
    order: Order!
    amount: Float!
    method: PaymentMethod!
    status: PaymentStatus!
    transactionId: String
    metadata: JSON
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PaymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    PAYPAL
    STRIPE
    BANK_TRANSFER
  }

  enum PaymentStatus {
    PENDING
    PROCESSING
    COMPLETED
    FAILED
    REFUNDED
  }

  input ProcessPaymentInput {
    orderId: ID!
    method: PaymentMethod!
    token: String!
    metadata: JSON
  }

  # Types Facture
  type Invoice {
    id: ID!
    invoiceNumber: String!
    order: Order!
    client: Client!
    total: Float!
    tax: Float!
    subtotal: Float!
    status: InvoiceStatus!
    pdfUrl: String
    createdAt: DateTime!
  }

  enum InvoiceStatus {
    DRAFT
    ISSUED
    PAID
    CANCELLED
  }
`;

module.exports = typeDefs;
