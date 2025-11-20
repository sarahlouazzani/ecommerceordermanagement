const express = require('express');
const orderController = require('../controllers/order.controller');
const router = express.Router();

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);

module.exports = router;
