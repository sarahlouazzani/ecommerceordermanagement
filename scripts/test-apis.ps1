# Script de tests des APIs

Write-Host "🧪 Tests des APIs E-Commerce" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "`n1. Test Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "✓ Health check OK" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "✗ Health check échoué" -ForegroundColor Red
}

# Test 2: Créer un client
Write-Host "`n2. Test création client..." -ForegroundColor Yellow
$clientData = @{
    email = "test@example.com"
    password = "SecurePass123!"
    firstName = "Jean"
    lastName = "Dupont"
    phone = "+33612345678"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body $clientData -ContentType "application/json"
    Write-Host "✓ Client créé avec succès" -ForegroundColor Green
    $clientId = $response.client.id
    $token = $response.token
    Write-Host "Token: $token" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Erreur création client: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GraphQL - Lister les produits
Write-Host "`n3. Test GraphQL - Liste produits..." -ForegroundColor Yellow
$query = @{
    query = "query { products(limit: 5) { id name price stock category } }"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/graphql" -Method Post -Body $query -ContentType "application/json"
    Write-Host "✓ Requête GraphQL OK" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ Erreur GraphQL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Créer un produit (nécessite droits admin)
Write-Host "`n4. Test création produit..." -ForegroundColor Yellow
$productData = @{
    name = "Laptop Dell XPS 15"
    description = "Ordinateur portable haute performance"
    price = 1299.99
    stock = 50
    category = "Informatique"
    images = @("https://example.com/laptop.jpg")
} | ConvertTo-Json

Write-Host "ℹ Ce test nécessite un token admin (à configurer)" -ForegroundColor Cyan

Write-Host "`n✅ Tests terminés!" -ForegroundColor Green
