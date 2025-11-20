const express = require('express');
const clientController = require('../controllers/client.controller');
const { validateClient } = require('../middlewares/validation.middleware');

const router = express.Router();

// CRUD Clients
router.post('/', validateClient, clientController.createClient);
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.get('/by-email/:email', clientController.getClientByEmail);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

module.exports = router;
