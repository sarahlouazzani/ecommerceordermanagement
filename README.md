# Plateforme E-Commerce en Microservices

Système de gestion de commandes e-commerce développé en architecture microservices avec API Gateway, GraphQL, Kafka et orchestration Docker/Podman.

## 🏗️ Architecture

### Microservices
- **API Gateway** (Port 3000) - Point d'entrée unique avec REST API et GraphQL
- **Clients Service** (Port 3001) - Gestion des clients et authentification
- **Products Service** (Port 3002) - Catalogue de produits
- **Orders Service** (Port 3003) - Gestion des commandes
- **Payments Service** (Port 3004) - Traitement des paiements
- **Invoices Service** (Port 3005) - Génération de factures
- **Notifications Service** (Port 3006) - Envoi de notifications via Kafka

### Infrastructure
- **PostgreSQL** - Base de données relationnelle
- **Kafka + Zookeeper** - Messagerie événementielle
- **Redis** - Cache et sessions

## 🚀 Technologies

- **Runtime**: Node.js
- **Language**: JavaScript
- **ORM**: TypeORM
- **GraphQL**: Apollo Server
- **Messaging**: Kafka (KafkaJS)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Container**: Docker/Podman
- **CI/CD**: GitHub Actions

## 📦 Installation

### Prérequis
- Node.js 18+
- npm 9+
- Docker ou Podman
- PostgreSQL 15+

### Installation locale

1. **Cloner le repository**
```bash
git clone <repository-url>
cd App2
```

2. **Configuration environnement**
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

3. **Installer les dépendances**
```bash
npm run install:all
```

4. **Démarrer l'infrastructure**
```bash
# Avec Docker Compose
docker-compose up -d

# Avec Podman Compose
podman-compose up -d
```

5. **Démarrer les services en développement**
```bash
# Gateway
npm run dev:gateway

# Services individuels (dans des terminaux séparés)
npm run dev:clients
npm run dev:products
npm run dev:orders
npm run dev:payments
npm run dev:invoices
npm run dev:notifications
```

## 🔌 API Endpoints

### API Gateway (http://localhost:3000)

#### REST API
- `GET /health` - Health check
- `POST /api/auth/login` - Authentification
- `POST /api/auth/register` - Inscription

#### GraphQL
- `POST /graphql` - Endpoint GraphQL
- `GET /graphql` - GraphQL Playground (dev)

### Exemples de requêtes GraphQL

```graphql
# Créer un client
mutation {
  createClient(input: {
    email: "client@example.com"
    firstName: "Jean"
    lastName: "Dupont"
    password: "SecurePass123!"
  }) {
    id
    email
    firstName
    lastName
  }
}

# Lister les produits
query {
  products(limit: 10) {
    id
    name
    price
    stock
    category
  }
}

# Créer une commande
mutation {
  createOrder(input: {
    clientId: "uuid-client"
    items: [
      { productId: "uuid-product", quantity: 2 }
    ]
  }) {
    id
    total
    status
    items {
      product {
        name
      }
      quantity
      price
    }
  }
}
```

## 📊 Événements Kafka

### Topics
- `client.created` - Nouveau client créé
- `order.created` - Nouvelle commande créée
- `order.updated` - Commande mise à jour
- `payment.processed` - Paiement traité
- `payment.failed` - Échec de paiement
- `invoice.generated` - Facture générée
- `notification.email` - Envoi d'email
- `notification.sms` - Envoi de SMS

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev:gateway          # Démarrer l'API Gateway
npm run dev:clients          # Démarrer le service Clients
npm run dev:products         # Démarrer le service Produits
npm run dev:orders           # Démarrer le service Commandes
npm run dev:payments         # Démarrer le service Paiements
npm run dev:invoices         # Démarrer le service Factures
npm run dev:notifications    # Démarrer le service Notifications

# Build
npm run build:all            # Build tous les services

# Tests
npm test                     # Lancer tous les tests

# Docker/Podman
npm run docker:up            # Démarrer les conteneurs
npm run docker:down          # Arrêter les conteneurs
npm run docker:logs          # Voir les logs
```

## 🔒 Sécurité

- Authentification JWT
- Validation des entrées
- Rate limiting
- CORS configuré
- Variables d'environnement sécurisées
- Hashage des mots de passe (bcrypt)

## 📈 Monitoring et Logging

- Winston pour le logging structuré
- Morgan pour les logs HTTP
- Health checks sur tous les services
- Métriques de performance

## 🧪 Tests & Validation

### ✅ Résultats des Tests

L'application a été testée avec succès sur toutes les fonctionnalités principales :

#### Test 1: Health Check ✅
```
Status: ✅ PASSED
Gateway: healthy/degraded
Services testés:
  ✓ Clients Service: healthy
  ✓ Products Service: healthy
  ✓ Orders Service: healthy
  ✓ Payments Service: healthy
  ✓ Invoices Service: healthy
  ✓ Notifications Service: healthy
```

#### Test 2: Inscription Utilisateur ✅
```
Status: ✅ PASSED
Request:
  POST /api/auth/register
  {
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }

Response:
  {
    "message": "Inscription réussie",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
```

#### Test 3: Connexion Utilisateur ✅
```
Status: ✅ PASSED
Request:
  POST /api/auth/login
  {
    "email": "test@example.com",
    "password": "SecurePass123!"
  }

Response:
  {
    "message": "Connexion réussie",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "client": {
      "id": "f55c42b3-d992-45be-bec0-eea951696757",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User"
    }
  }
```

#### Test 4: Création de Produit ✅
```
Status: ✅ PASSED
Request:
  POST /api/products
  Authorization: Bearer <token>
  {
    "name": "Laptop Dell XPS 15",
    "description": "High-performance laptop",
    "price": 1299.99,
    "stock": 25,
    "category": "Electronics"
  }

Response:
  {
    "id": "1f51accb-b1d0-4436-a3fe-22f4862426aa",
    "name": "Laptop Dell XPS 15",
    "price": 1299.99,
    "stock": 25,
    "category": "Electronics",
    "createdAt": "2025-11-21T10:04:47.000Z"
  }
```

#### Test 5: Liste des Produits ✅
```
Status: ✅ PASSED
Request:
  GET /api/products

Response:
  [
    {
      "id": "1f51accb-b1d0-4436-a3fe-22f4862426aa",
      "name": "Laptop Dell XPS 15",
      "price": 1299.99,
      "stock": 25
    },
    {
      "id": "b5d02dbc-43af-49f0-966f-b9a0e13c4400",
      "name": "iPhone 15 Pro",
      "price": 1199.99,
      "stock": 30
    }
  ]
```

#### Test 6: Création de Commande ✅
```
Status: ✅ PASSED
Request:
  POST /api/orders
  Authorization: Bearer <token>
  {
    "clientId": "f55c42b3-d992-45be-bec0-eea951696757",
    "items": [{
      "productId": "1f51accb-b1d0-4436-a3fe-22f4862426aa",
      "quantity": 2,
      "unitPrice": 1299.99
    }],
    "shippingAddress": {
      "street": "123 rue de Test",
      "city": "Paris",
      "postalCode": "75001",
      "country": "France"
    }
  }

Response:
  {
    "id": "43f35c6a-40fa-4f3f-a3ae-08de255c4e51",
    "orderNumber": "ORD-20251121-0001",
    "total": 2599.98,
    "status": "PENDING",
    "items": [...]
  }
```

#### Test 7: Liste des Commandes ✅
```
Status: ✅ PASSED
Request:
  GET /api/orders
  Authorization: Bearer <token>

Response: 1 commande(s) trouvée(s)
  - Order #ORD-20251121-0001: €2599.98 - Status: PENDING
```

### 📊 Résumé des Tests

```
✅ Health Check: PASSED
✅ User Registration: PASSED
✅ User Login: PASSED
✅ Product Creation: PASSED
✅ Product List: PASSED
✅ Order Creation: PASSED
✅ Order List: PASSED

Résultat: 7/7 tests réussis (100%)
```

### 🔬 Tests Unitaires et d'Intégration

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

### 🧪 Script de Test Complet

Pour reproduire les tests ci-dessus, utilisez le script suivant :

```powershell
# Voir le fichier: scripts/test-apis.ps1
.\scripts\test-apis.ps1
```

Ou consultez le guide complet : [USAGE_GUIDE.md](./USAGE_GUIDE.md)

## 🚢 Déploiement

### Build des images
```bash
# Build toutes les images
docker-compose build

# Ou avec Podman
podman-compose build
```

### Production
```bash
# Démarrer en mode production
NODE_ENV=production docker-compose up -d
```

## 📝 Structure du projet

```
App2/
├── gateway/                 # API Gateway
│   ├── src/
│   │   ├── graphql/        # Schémas et resolvers GraphQL
│   │   ├── rest/           # Routes REST
│   │   ├── middlewares/    # Middlewares Express
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── services/
│   ├── clients-service/    # Service Clients
│   ├── products-service/   # Service Produits
│   ├── orders-service/     # Service Commandes
│   ├── payments-service/   # Service Paiements
│   ├── invoices-service/   # Service Factures
│   └── notifications-service/ # Service Notifications
├── shared/                 # Code partagé
│   ├── database/          # Configuration TypeORM
│   ├── kafka/             # Utilitaires Kafka
│   └── utils/             # Utilitaires communs
├── docker-compose.yml
├── init-db.sql
└── package.json
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

MIT

## 👥 Auteurs

Votre équipe e-commerce

## 📞 Support

Pour toute question, ouvrir une issue sur GitHub.
