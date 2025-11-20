const { AppDataSource } = require('../config/database');
const { publishEvent } = require('../config/kafka');
const logger = require('../config/logger');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentRepository = AppDataSource.getRepository('Payment');

exports.processPayment = async (req, res, next) => {
  try {
    const { orderId, method, token, metadata } = req.body;

    // Créer le paiement
    const payment = paymentRepository.create({
      orderId,
      amount: metadata.amount,
      method,
      status: 'PROCESSING',
      metadata
    });

    await paymentRepository.save(payment);

    // Simuler traitement Stripe
    try {
      // En production: const charge = await stripe.charges.create({...});
      const transactionId = `txn_${Date.now()}`;
      
      payment.status = 'COMPLETED';
      payment.transactionId = transactionId;
      await paymentRepository.save(payment);

      await publishEvent('payment.processed', { id: payment.id, orderId, status: 'COMPLETED' });
      logger.info(`Paiement traité: ${payment.id}`);

      res.status(201).json(payment);
    } catch (error) {
      payment.status = 'FAILED';
      await paymentRepository.save(payment);
      await publishEvent('payment.failed', { id: payment.id, orderId });
      throw error;
    }
  } catch (error) {
    logger.error('Erreur paiement:', error);
    next(error);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentRepository.findOne({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentRepository.findOne({ where: { id } });
    
    if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });
    
    // Simuler remboursement
    payment.status = 'REFUNDED';
    await paymentRepository.save(payment);

    await publishEvent('payment.refunded', { id });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};
