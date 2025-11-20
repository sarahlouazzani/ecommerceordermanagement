const axios = require('axios');
const logger = require('../config/logger');

// URLs des microservices
const SERVICES = {
  clients: process.env.CLIENTS_SERVICE_URL || 'http://localhost:3001',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://localhost:3005'
};

// Helper pour les appels aux microservices
const callService = async (service, endpoint, method = 'GET', data = null, headers = {}) => {
  try {
    const response = await axios({
      method,
      url: `${SERVICES[service]}${endpoint}`,
      data,
      headers,
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    logger.error(`Erreur appel ${service}:`, error.message);
    throw new Error(`Service ${service} indisponible: ${error.message}`);
  }
};

const resolvers = {
  Query: {
    ping: () => 'pong',

    // Clients
    client: async (_, { id }, context) => {
      return callService('clients', `/api/clients/${id}`);
    },
    clients: async (_, { limit = 10, offset = 0 }) => {
      return callService('clients', `/api/clients?limit=${limit}&offset=${offset}`);
    },

    // Produits
    product: async (_, { id }) => {
      return callService('products', `/api/products/${id}`);
    },
    products: async (_, { limit = 10, offset = 0, category }) => {
      let query = `limit=${limit}&offset=${offset}`;
      if (category) query += `&category=${category}`;
      return callService('products', `/api/products?${query}`);
    },

    // Commandes
    order: async (_, { id }, context) => {
      return callService('orders', `/api/orders/${id}`);
    },
    orders: async (_, { clientId, status }) => {
      let query = '';
      if (clientId) query += `?clientId=${clientId}`;
      if (status) query += `${query ? '&' : '?'}status=${status}`;
      return callService('orders', `/api/orders${query}`);
    },
    myOrders: async (_, __, context) => {
      if (!context.user) throw new Error('Non authentifié');
      return callService('orders', `/api/orders?clientId=${context.user.id}`);
    },

    // Paiements
    payment: async (_, { id }) => {
      return callService('payments', `/api/payments/${id}`);
    },

    // Factures
    invoice: async (_, { id }) => {
      return callService('invoices', `/api/invoices/${id}`);
    },
    invoices: async (_, { clientId }) => {
      const query = clientId ? `?clientId=${clientId}` : '';
      return callService('invoices', `/api/invoices${query}`);
    }
  },

  Mutation: {
    // Clients
    createClient: async (_, { input }) => {
      return callService('clients', '/api/clients', 'POST', input);
    },
    updateClient: async (_, { id, input }, context) => {
      if (!context.user) throw new Error('Non authentifié');
      return callService('clients', `/api/clients/${id}`, 'PUT', input);
    },
    deleteClient: async (_, { id }, context) => {
      if (!context.user) throw new Error('Non authentifié');
      await callService('clients', `/api/clients/${id}`, 'DELETE');
      return true;
    },

    // Produits
    createProduct: async (_, { input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      return callService('products', '/api/products', 'POST', input);
    },
    updateProduct: async (_, { id, input }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      return callService('products', `/api/products/${id}`, 'PUT', input);
    },
    deleteProduct: async (_, { id }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      await callService('products', `/api/products/${id}`, 'DELETE');
      return true;
    },
    updateStock: async (_, { id, quantity }, context) => {
      return callService('products', `/api/products/${id}/stock`, 'PATCH', { quantity });
    },

    // Commandes
    createOrder: async (_, { input }, context) => {
      if (!context.user) throw new Error('Non authentifié');
      return callService('orders', '/api/orders', 'POST', input);
    },
    updateOrderStatus: async (_, { id, status }, context) => {
      return callService('orders', `/api/orders/${id}/status`, 'PATCH', { status });
    },
    cancelOrder: async (_, { id }, context) => {
      if (!context.user) throw new Error('Non authentifié');
      return callService('orders', `/api/orders/${id}/cancel`, 'POST');
    },

    // Paiements
    processPayment: async (_, { input }) => {
      return callService('payments', '/api/payments', 'POST', input);
    },
    refundPayment: async (_, { id }, context) => {
      if (!context.user || context.user.role !== 'admin') {
        throw new Error('Accès non autorisé');
      }
      return callService('payments', `/api/payments/${id}/refund`, 'POST');
    },

    // Factures
    generateInvoice: async (_, { orderId }) => {
      return callService('invoices', '/api/invoices', 'POST', { orderId });
    }
  },

  // Résolveurs de champs imbriqués
  Order: {
    client: async (parent) => {
      return callService('clients', `/api/clients/${parent.clientId}`);
    },
    payment: async (parent) => {
      if (!parent.paymentId) return null;
      return callService('payments', `/api/payments/${parent.paymentId}`);
    },
    invoice: async (parent) => {
      if (!parent.invoiceId) return null;
      return callService('invoices', `/api/invoices/${parent.invoiceId}`);
    }
  },

  OrderItem: {
    product: async (parent) => {
      return callService('products', `/api/products/${parent.productId}`);
    }
  },

  Client: {
    orders: async (parent) => {
      return callService('orders', `/api/orders?clientId=${parent.id}`);
    }
  },

  Payment: {
    order: async (parent) => {
      return callService('orders', `/api/orders/${parent.orderId}`);
    }
  },

  Invoice: {
    order: async (parent) => {
      return callService('orders', `/api/orders/${parent.orderId}`);
    },
    client: async (parent) => {
      return callService('clients', `/api/clients/${parent.clientId}`);
    }
  }
};

module.exports = resolvers;
