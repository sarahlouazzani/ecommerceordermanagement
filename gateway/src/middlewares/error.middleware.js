const logger = require('../config/logger');

/**
 * Middleware global de gestion d'erreurs
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Erreur capturée:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Erreur de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.details
    });
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Erreur d\'authentification',
      message: err.message
    });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};
