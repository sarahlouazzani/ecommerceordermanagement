# Guide de démarrage rapide - Plateforme E-Commerce

## Prérequis
- Node.js 18+
- Docker ou Podman
- PostgreSQL 15+ (ou via Docker)
- Git

## Installation rapide

### 1. Cloner et configurer
```powershell
# Cloner le projet
git clone <votre-repo>
cd App2

# Copier la configuration
Copy-Item .env.example .env
# Éditer .env avec vos paramètres
```

### 2. Démarrer avec Docker/Podman
```powershell
# Démarrer toute la plateforme
.\scripts\start.ps1

# Ou manuellement
podman-compose up -d
```

### 3. Développement local

#### Installer les dépendances
```powershell
npm run install:all
```

#### Démarrer l'infrastructure
```powershell
podman-compose up -d postgres kafka zookeeper redis
```

#### Démarrer les services individuellement
```powershell
# Terminal 1 - API Gateway
npm run dev:gateway

# Terminal 2 - Clients Service
npm run dev:clients

# Terminal 3 - Products Service
npm run dev:products

# Terminal 4 - Orders Service
npm run dev:orders

# Terminal 5 - Payments Service
npm run dev:payments

# Terminal 6 - Invoices Service
npm run dev:invoices

# Terminal 7 - Notifications Service
npm run dev:notifications
```

## Tests

### Tester les APIs
```powershell
.\scripts\test-apis.ps1
```

### Health Check manuel
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health"
```

### GraphQL Playground
Ouvrir dans le navigateur: http://localhost:3000/graphql

## Exemples de requêtes

### REST API

#### Inscription
```powershell
$body = @{
    email = "user@example.com"
    password = "Password123!"
    firstName = "John"
    lastName = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post -Body $body -ContentType "application/json"
```

#### Connexion
```powershell
$body = @{
    email = "user@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method Post -Body $body -ContentType "application/json"

$token = $response.token
```

### GraphQL

#### Lister les produits
```graphql
query {
  products(limit: 10) {
    id
    name
    price
    stock
    category
  }
}
```

#### Créer une commande
```graphql
mutation {
  createOrder(input: {
    clientId: "uuid-client"
    items: [
      { productId: "uuid-product", quantity: 2 }
    ]
    shippingAddress: {
      street: "123 Rue Example"
      city: "Paris"
      postalCode: "75001"
      country: "France"
    }
  }) {
    id
    orderNumber
    total
    status
  }
}
```

## Gestion

### Script de gestion interactif
```powershell
.\scripts\manage.ps1
```

### Commandes Docker/Podman

#### Voir les logs
```powershell
podman-compose logs -f

# Service spécifique
podman-compose logs -f api-gateway
```

#### Arrêter
```powershell
podman-compose down
```

#### Rebuild
```powershell
podman-compose build
podman-compose up -d
```

#### Nettoyer
```powershell
podman-compose down -v
podman system prune -af
```

## Ports

| Service | Port |
|---------|------|
| API Gateway | 3000 |
| Clients Service | 3001 |
| Products Service | 3002 |
| Orders Service | 3003 |
| Payments Service | 3004 |
| Invoices Service | 3005 |
| Notifications Service | 3006 |
| PostgreSQL | 55432 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| Redis | 6379 |

## Troubleshooting

### Les services ne démarrent pas
```powershell
# Vérifier les logs
podman-compose logs

# Vérifier si les ports sont disponibles
netstat -an | Select-String "3000|55432|9092"

# Redémarrer
podman-compose restart
```

### Erreur de connexion à PostgreSQL
```powershell
# Vérifier que PostgreSQL est démarré
podman-compose ps postgres

# Recréer la base
podman-compose down -v
podman-compose up -d postgres
```

### Kafka ne fonctionne pas
```powershell
# Attendre plus longtemps le démarrage (Kafka est lent)
Start-Sleep -Seconds 30

# Vérifier Zookeeper
podman-compose logs zookeeper
```

## Support

Pour toute question, consulter le README.md ou ouvrir une issue sur GitHub.
