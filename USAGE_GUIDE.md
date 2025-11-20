# 🚀 E-Commerce Platform - Usage Guide

## Application Overview

Your e-commerce microservices platform is now running with the following services:

### 🌐 Available Endpoints

| Service | Port | URL |
|---------|------|-----|
| **API Gateway** | 3000 | http://localhost:3000 |
| **GraphQL Playground** | 3000 | http://localhost:3000/graphql |
| **Clients Service** | 3001 | http://localhost:3001 |
| **Products Service** | 3002 | http://localhost:3002 |
| **Orders Service** | 3003 | http://localhost:3003 |
| **Payments Service** | 3004 | http://localhost:3004 |
| **Invoices Service** | 3005 | http://localhost:3005 |
| **Notifications Service** | 3006 | http://localhost:3006 |

### 🗄️ Infrastructure

- **PostgreSQL**: Port 55432
- **Kafka**: Port 9092
- **Redis**: Port 6379
- **Zookeeper**: Port 2181

---

## 📋 Quick Start Testing

### 1️⃣ Register a New User

```powershell
$body = @{
    email = "user@example.com"
    password = "SecurePass123!"
    firstName = "John"
    lastName = "Doe"
    phone = "+33612345678"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
    -Method Post -Body $body -ContentType "application/json"
```

**Response:**
```json
{
  "message": "Inscription réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2️⃣ Login

```powershell
$body = @{
    email = "user@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method Post -Body $body -ContentType "application/json"

# Save token for future requests
$token = $loginResponse.token
```

**Response:**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "client": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 3️⃣ Create Products

```powershell
$headers = @{ Authorization = "Bearer $token" }

$product = @{
    name = "Laptop Dell XPS 15"
    description = "High-performance laptop"
    price = 1299.99
    stock = 25
    category = "Electronics"
    images = @("https://example.com/laptop.jpg")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3002/api/products" `
    -Method Post -Body $product -ContentType "application/json" -Headers $headers
```

---

### 4️⃣ List Products (REST)

```powershell
# Get all products
Invoke-RestMethod -Uri "http://localhost:3002/api/products" -Method Get

# Get a specific product
Invoke-RestMethod -Uri "http://localhost:3002/api/products/{productId}" -Method Get

# Search products by category
Invoke-RestMethod -Uri "http://localhost:3002/api/products?category=Electronics" -Method Get
```

---

### 5️⃣ GraphQL Queries

#### Open GraphQL Playground
Navigate to: **http://localhost:3000/graphql**

#### Query Products
```graphql
query {
  products {
    id
    name
    price
    stock
    category
    description
  }
}
```

#### Query Single Product
```graphql
query {
  product(id: "product-uuid") {
    id
    name
    description
    price
    stock
    category
    images
  }
}
```

#### Create Order (Mutation)
```graphql
mutation {
  createOrder(input: {
    clientId: "your-client-uuid"
    items: [
      {
        productId: "product-uuid"
        quantity: 2
        unitPrice: 1299.99
      }
    ]
    shippingAddress: {
      street: "123 Main Street"
      city: "Paris"
      postalCode: "75001"
      country: "France"
    }
  }) {
    id
    orderNumber
    total
    status
    items {
      productId
      quantity
      unitPrice
    }
  }
}
```

---

### 6️⃣ Create an Order (REST)

```powershell
$headers = @{ Authorization = "Bearer $token" }

$order = @{
    clientId = "your-client-uuid"
    items = @(
        @{
            productId = "product-uuid"
            quantity = 2
            unitPrice = 1299.99
        }
    )
    shippingAddress = @{
        street = "123 Main Street"
        city = "Paris"
        postalCode = "75001"
        country = "France"
    }
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3003/api/orders" `
    -Method Post -Body $order -ContentType "application/json" -Headers $headers
```

---

### 7️⃣ Get Orders

```powershell
$headers = @{ Authorization = "Bearer $token" }

# Get all orders for logged-in client
Invoke-RestMethod -Uri "http://localhost:3003/api/orders" `
    -Method Get -Headers $headers

# Get specific order
Invoke-RestMethod -Uri "http://localhost:3003/api/orders/{orderId}" `
    -Method Get -Headers $headers
```

---

### 8️⃣ Process Payment

```powershell
$headers = @{ Authorization = "Bearer $token" }

$payment = @{
    orderId = "order-uuid"
    amount = 2599.98
    paymentMethod = "CREDIT_CARD"
    cardToken = "tok_visa"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3004/api/payments" `
    -Method Post -Body $payment -ContentType "application/json" -Headers $headers
```

---

## 🧪 Complete Testing Script

Save this as `test-complete.ps1`:

```powershell
Write-Host "`n🧪 Complete E-Commerce Testing" -ForegroundColor Cyan
$baseUrl = "http://localhost:3000"

# 1. Register
Write-Host "`n1️⃣  Registering user..." -ForegroundColor Yellow
$registerBody = @{
    email = "testuser@example.com"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    phone = "+33600000000"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" `
        -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ User registered" -ForegroundColor Green
} catch {
    Write-Host "⚠️  User may already exist, continuing..." -ForegroundColor Yellow
}

# 2. Login
Write-Host "`n2️⃣  Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "Test123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" `
    -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$clientId = $loginResponse.client.id
Write-Host "✅ Logged in - Token: $($token.Substring(0,20))..." -ForegroundColor Green

# 3. Create Product
Write-Host "`n3️⃣  Creating product..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $token" }
$productBody = @{
    name = "Test Product"
    description = "A test product"
    price = 99.99
    stock = 100
    category = "Test"
} | ConvertTo-Json

$product = Invoke-RestMethod -Uri "http://localhost:3002/api/products" `
    -Method Post -Body $productBody -ContentType "application/json" -Headers $headers
Write-Host "✅ Product created: $($product.id)" -ForegroundColor Green

# 4. List Products via GraphQL
Write-Host "`n4️⃣  Listing products via GraphQL..." -ForegroundColor Yellow
$graphqlQuery = @{
    query = "query { products { id name price } }"
} | ConvertTo-Json

$graphqlResponse = Invoke-RestMethod -Uri "$baseUrl/graphql" `
    -Method Post -Body $graphqlQuery -ContentType "application/json"
Write-Host "✅ Found $($graphqlResponse.data.products.Count) products" -ForegroundColor Green

# 5. Create Order
Write-Host "`n5️⃣  Creating order..." -ForegroundColor Yellow
$orderBody = @{
    clientId = $clientId
    items = @(
        @{
            productId = $product.id
            quantity = 2
            unitPrice = $product.price
        }
    )
    shippingAddress = @{
        street = "123 Test St"
        city = "Paris"
        postalCode = "75001"
        country = "France"
    }
} | ConvertTo-Json -Depth 5

$order = Invoke-RestMethod -Uri "http://localhost:3003/api/orders" `
    -Method Post -Body $orderBody -ContentType "application/json" -Headers $headers
Write-Host "✅ Order created: $($order.id) - Total: €$($order.total)" -ForegroundColor Green

Write-Host "`n✅ All tests completed successfully!" -ForegroundColor Green
```

---

## 🔍 Health Check

Check the status of all services:

```powershell
# Basic health check
(Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing).Content

# Check individual services
3001..3006 | ForEach-Object {
    $port = $_
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -UseBasicParsing -TimeoutSec 2
        Write-Host "Port $port : ✅ HEALTHY" -ForegroundColor Green
    } catch {
        Write-Host "Port $port : ❌ UNHEALTHY" -ForegroundColor Red
    }
}
```

---

## 🛠️ Useful Commands

### View Logs
```powershell
# View container logs
podman logs ecommerce-postgres
podman logs ecommerce-kafka

# View all containers
podman ps -a
```

### Database Access
```powershell
# Connect to PostgreSQL
podman exec -it ecommerce-postgres psql -U ecommerce -d ecommerce

# List tables
\dt clients.*;
\dt products.*;
\dt orders.*;
```

### Stop Services
```powershell
# Stop all Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Stop infrastructure containers
podman stop ecommerce-postgres ecommerce-kafka ecommerce-zookeeper ecommerce-redis
```

### Restart Services
```powershell
# Start infrastructure
podman start ecommerce-postgres ecommerce-kafka ecommerce-zookeeper ecommerce-redis

# Start services (run from project root)
.\start-all.ps1
```

---

## 🎯 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Client Endpoints (Port 3001)

- `GET /api/clients` - List clients
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Product Endpoints (Port 3002)

- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

### Order Endpoints (Port 3003)

- `GET /api/orders` - List orders for logged-in client
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Payment Endpoints (Port 3004)

- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Process payment
- `GET /api/payments/order/:orderId` - Get payments for order

### Invoice Endpoints (Port 3005)

- `GET /api/invoices` - List invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `GET /api/invoices/order/:orderId` - Get invoice for order

---

## 🔗 Integration with Browser

You can use the GraphQL Playground by opening your browser to:
**http://localhost:3000/graphql**

This provides an interactive interface to:
- Explore the GraphQL schema
- Test queries and mutations
- View documentation
- Execute requests with auto-completion

---

## 📊 Monitoring Kafka Events

The platform uses Kafka for event-driven communication:

**Events Published:**
- `client.created` - When a new client registers
- `order.created` - When an order is created
- `payment.processed` - When a payment is completed
- `invoice.generated` - When an invoice is created

**Consumers:**
- Notifications Service listens to all events for email notifications

---

## 💡 Tips

1. **Save your token** after login for authenticated requests
2. **Use GraphQL Playground** for easier API exploration
3. **Check service logs** in the terminal windows for debugging
4. **Monitor Kafka** messages for event-driven flows
5. **Use the health endpoint** to verify all services are running

---

## 🐛 Troubleshooting

**Services not responding?**
```powershell
# Check if services are running
Get-Process node
```

**Port already in use?**
```powershell
# Find and kill process on specific port
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**Database connection issues?**
```powershell
# Restart PostgreSQL container
podman restart ecommerce-postgres
```

---

## 📝 Notes

- All passwords should contain at least 8 characters with uppercase, lowercase, and numbers
- JWT tokens expire after 24 hours (configurable)
- File uploads are limited to 5MB
- API rate limiting is set to 100 requests per 15 minutes per IP

Happy testing! 🚀
