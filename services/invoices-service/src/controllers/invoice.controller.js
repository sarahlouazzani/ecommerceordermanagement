const { AppDataSource } = require('../config/database');
const { publishEvent } = require('../config/kafka');
const logger = require('../config/logger');
const axios = require('axios');

const invoiceRepository = AppDataSource.getRepository('Invoice');
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://localhost:3003';

function generateInvoiceNumber() {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

exports.generateInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    // Récupérer la commande
    const orderResponse = await axios.get(`${ORDERS_SERVICE_URL}/api/orders/${orderId}`);
    const order = orderResponse.data;

    const TAX_RATE = 0.20; // 20% TVA
    const subtotal = parseFloat(order.total);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // Créer la facture
    const invoice = invoiceRepository.create({
      invoiceNumber: generateInvoiceNumber(),
      orderId,
      clientId: order.clientId,
      subtotal,
      tax,
      total,
      status: 'ISSUED'
    });

    await invoiceRepository.save(invoice);

    await publishEvent('invoice.generated', { id: invoice.id, orderId, invoiceNumber: invoice.invoiceNumber });
    logger.info(`Facture générée: ${invoice.id}`);

    res.status(201).json(invoice);
  } catch (error) {
    logger.error('Erreur génération facture:', error);
    next(error);
  }
};

exports.getAllInvoices = async (req, res, next) => {
  try {
    const { clientId } = req.query;
    const where = clientId ? { clientId } : {};
    const invoices = await invoiceRepository.find({ where });
    res.json(invoices);
  } catch (error) {
    next(error);
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await invoiceRepository.findOne({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};
