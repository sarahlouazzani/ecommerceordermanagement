const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const router = express.Router();
const CLIENTS_SERVICE_URL = process.env.CLIENTS_SERVICE_URL || 'http://localhost:3001';

/**
 * POST /api/auth/register
 * Inscription d'un nouveau client
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Email, mot de passe, prénom et nom sont requis'
      });
    }

    // Vérifier la force du mot de passe
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le client via le microservice
    const response = await axios.post(`${CLIENTS_SERVICE_URL}/api/clients`, {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone
    });

    const client = response.data;

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: client.id, 
        email: client.email,
        role: client.role || 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'inscription:', error.message);
    
    if (error.response?.status === 409) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un client
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe sont requis'
      });
    }

    // Récupérer le client via le microservice
    const response = await axios.get(`${CLIENTS_SERVICE_URL}/api/clients/by-email/${email}`);
    const client = response.data;

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, client.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { 
        id: client.id, 
        email: client.email,
        role: client.role || 'client'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      client: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la connexion:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations du client connecté
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer les infos du client
    const response = await axios.get(`${CLIENTS_SERVICE_URL}/api/clients/${decoded.id}`);
    const client = response.data;

    res.json({
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      address: client.address
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }

    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
