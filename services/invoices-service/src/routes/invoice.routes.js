const express = require('express');
const invoiceController = require('../controllers/invoice.controller');
const router = express.Router();

router.post('/', invoiceController.generateInvoice);
router.get('/', invoiceController.getAllInvoices);
router.get('/:id', invoiceController.getInvoiceById);

module.exports = router;
