const { AppDataSource } = require('../config/database');
const { Client } = require('../entities/Client');
const { publishEvent } = require('../config/kafka');
const logger = require('../config/logger');

const clientRepository = AppDataSource.getRepository('Client');

/**
 * Créer un nouveau client
 */
exports.createClient = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    // Vérifier si l'email existe déjà
    const existingClient = await clientRepository.findOne({ where: { email } });
    if (existingClient) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Créer le client
    const client = clientRepository.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      address
    });

    await clientRepository.save(client);

    // Publier l'événement
    await publishEvent('client.created', {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      createdAt: client.createdAt
    });

    logger.info(`Client créé: ${client.id}`);

    // Ne pas retourner le mot de passe
    delete client.password;

    res.status(201).json(client);
  } catch (error) {
    logger.error('Erreur création client:', error);
    next(error);
  }
};

/**
 * Obtenir tous les clients
 */
exports.getAllClients = async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    const [clients, total] = await clientRepository.findAndCount({
      take: parseInt(limit),
      skip: parseInt(offset),
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'address', 'createdAt', 'updatedAt']
    });

    res.json({
      data: clients,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    logger.error('Erreur récupération clients:', error);
    next(error);
  }
};

/**
 * Obtenir un client par ID
 */
exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await clientRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'address', 'createdAt', 'updatedAt']
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    res.json(client);
  } catch (error) {
    logger.error('Erreur récupération client:', error);
    next(error);
  }
};

/**
 * Obtenir un client par email (pour l'authentification)
 */
exports.getClientByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;

    const client = await clientRepository.findOne({
      where: { email }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    // Retourner le mot de passe pour l'authentification
    res.json(client);
  } catch (error) {
    logger.error('Erreur récupération client par email:', error);
    next(error);
  }
};

/**
 * Mettre à jour un client
 */
exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Ne pas permettre la mise à jour du mot de passe via cette route
    delete updates.password;
    delete updates.email;

    const client = await clientRepository.findOne({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    await clientRepository.update(id, updates);

    const updatedClient = await clientRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'phone', 'address', 'updatedAt']
    });

    // Publier l'événement
    await publishEvent('client.updated', {
      id: updatedClient.id,
      updates,
      updatedAt: updatedClient.updatedAt
    });

    logger.info(`Client mis à jour: ${id}`);

    res.json(updatedClient);
  } catch (error) {
    logger.error('Erreur mise à jour client:', error);
    next(error);
  }
};

/**
 * Supprimer un client
 */
exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await clientRepository.findOne({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }

    await clientRepository.delete(id);

    // Publier l'événement
    await publishEvent('client.deleted', {
      id,
      deletedAt: new Date()
    });

    logger.info(`Client supprimé: ${id}`);

    res.status(204).send();
  } catch (error) {
    logger.error('Erreur suppression client:', error);
    next(error);
  }
};
