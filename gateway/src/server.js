const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./config/logger');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const authRoutes = require('./rest/auth.routes');
const healthRoutes = require('./rest/health.routes');
const { authMiddleware } = require('./middlewares/auth.middleware');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.GATEWAY_PORT || 3000;

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite de 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
});
app.use('/api/', limiter);

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging HTTP
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// Routes REST
app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

// Configuration Apollo Server
async function startApolloServer() {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      logger.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
        path: error.path
      };
    },
    introspection: process.env.NODE_ENV !== 'production',
  });

  await apolloServer.start();

  // GraphQL endpoint avec authentification optionnelle
  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Ajouter l'utilisateur au contexte si authentifié
        const token = req.headers.authorization?.replace('Bearer ', '');
        let user = null;
        
        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            user = jwt.verify(token, process.env.JWT_SECRET);
          } catch (err) {
            logger.warn('Invalid token in GraphQL request');
          }
        }

        return { user, req };
      }
    })
  );

  logger.info('Apollo Server configuré sur /graphql');
}

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway E-Commerce',
    version: '1.0.0',
    endpoints: {
      graphql: '/graphql',
      health: '/health',
      auth: '/api/auth'
    }
  });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Démarrage du serveur
async function startServer() {
  try {
    await startApolloServer();
    
    app.listen(PORT, () => {
      logger.info(`🚀 API Gateway démarré sur http://localhost:${PORT}`);
      logger.info(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Erreur au démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
