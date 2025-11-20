FROM node:18-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le répertoire pour les logs
RUN mkdir -p logs

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV GATEWAY_PORT=3000

# Démarrer l'application
CMD ["node", "src/server.js"]
