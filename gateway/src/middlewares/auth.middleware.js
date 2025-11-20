const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

/**
 * Middleware d'authentification JWT
 */
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token d\'authentification manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Échec de l\'authentification:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré' });
    }

    res.status(500).json({ error: 'Erreur lors de l\'authentification' });
  }
};

/**
 * Middleware pour vérifier le rôle admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès non autorisé - Droits administrateur requis' });
  }
  next();
};

module.exports = {
  authMiddleware,
  requireAdmin
};
