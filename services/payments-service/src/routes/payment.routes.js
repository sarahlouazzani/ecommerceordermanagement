const express = require('express');
const paymentController = require('../controllers/payment.controller');
const router = express.Router();

router.post('/', paymentController.processPayment);
router.get('/:id', paymentController.getPaymentById);
router.post('/:id/refund', paymentController.refundPayment);

module.exports = router;
