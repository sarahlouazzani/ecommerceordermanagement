const logger = require('../config/logger');

exports.errorHandler = (err, req, res, next) => {
  logger.error('Erreur:', err);

  res.status(err.statusCode || 500).json({
    error: err.message || 'Erreur interne du serveur'
  });
};
