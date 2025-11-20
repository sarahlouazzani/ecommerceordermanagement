const { AppDataSource } = require('../config/database');
const { publishEvent } = require('../config/kafka');
const logger = require('../config/logger');
const axios = require('axios');

const orderRepository = AppDataSource.getRepository('Order');
const orderItemRepository = AppDataSource.getRepository('OrderItem');

const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3002';

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

exports.createOrder = async (req, res, next) => {
  try {
    const { clientId, items, shippingAddress } = req.body;

    // Calculer le total et créer les items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productResponse = await axios.get(`${PRODUCTS_SERVICE_URL}/api/products/${item.productId}`);
      const product = productResponse.data;

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Créer la commande
    const order = orderRepository.create({
      orderNumber: generateOrderNumber(),
      clientId,
      status: 'PENDING',
      total,
      shippingAddress
    });

    await orderRepository.save(order);

    // Créer les items
    for (const itemData of orderItems) {
      const orderItem = orderItemRepository.create({
        ...itemData,
        order
      });
      await orderItemRepository.save(orderItem);
    }

    await publishEvent('order.created', {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId,
      total
    });

    logger.info(`Commande créée: ${order.id}`);

    res.status(201).json(order);
  } catch (error) {
    logger.error('Erreur création commande:', error);
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { clientId, status } = req.query;
    const where = {};
    if (clientId) where.clientId = clientId;
    if (status) where.status = status;

    const orders = await orderRepository.find({
      where,
      relations: ['items']
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderRepository.findOne({
      where: { id: req.params.id },
      relations: ['items']
    });

    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await orderRepository.update(id, { status });
    const order = await orderRepository.findOne({ where: { id } });

    await publishEvent('order.status.updated', { id, status });

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await orderRepository.update(id, { status: 'CANCELLED' });
    const order = await orderRepository.findOne({ where: { id } });

    await publishEvent('order.cancelled', { id });

    res.json(order);
  } catch (error) {
    next(error);
  }
};
