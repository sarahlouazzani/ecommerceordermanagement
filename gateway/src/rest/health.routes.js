const express = require('express');
const axios = require('axios');
const logger = require('../config/logger');

const router = express.Router();

const SERVICES = {
  clients: process.env.CLIENTS_SERVICE_URL || 'http://localhost:3001',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3003',
  payments: process.env.PAYMENTS_SERVICE_URL || 'http://localhost:3004',
  invoices: process.env.INVOICES_SERVICE_URL || 'http://localhost:3005',
  notifications: process.env.NOTIFICATIONS_SERVICE_URL || 'http://localhost:3006'
};

/**
 * GET /health
 * Health check du gateway et de tous les microservices
 */
router.get('/', async (req, res) => {
  const health = {
    gateway: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    services: {}
  };

  // Vérifier chaque microservice
  for (const [name, url] of Object.entries(SERVICES)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      health.services[name] = {
        status: 'healthy',
        url,
        response: response.data
      };
    } catch (error) {
      health.services[name] = {
        status: 'unhealthy',
        url,
        error: error.message
      };
      logger.error(`Service ${name} est indisponible:`, error.message);
    }
  }

  // Déterminer le statut global
  const allHealthy = Object.values(health.services).every(s => s.status === 'healthy');
  health.gateway.status = allHealthy ? 'healthy' : 'degraded';

  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /health/ready
 * Readiness probe pour Kubernetes/Docker
 */
router.get('/ready', (req, res) => {
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /health/live
 * Liveness probe pour Kubernetes/Docker
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
