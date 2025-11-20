# Script de démarrage rapide

Write-Host "🚀 Démarrage de la plateforme e-commerce..." -ForegroundColor Cyan

# Vérifier si .env existe
if (-Not (Test-Path ".env")) {
    Write-Host "⚠ Fichier .env non trouvé, copie depuis .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Fichier .env créé - Veuillez le configurer" -ForegroundColor Green
}

# Démarrer l'infrastructure
Write-Host "`n📦 Démarrage de l'infrastructure (PostgreSQL, Kafka, Redis)..." -ForegroundColor Cyan
podman-compose up -d postgres kafka zookeeper redis

Write-Host "`n⏳ Attente de 10 secondes pour l'initialisation..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Démarrer les services
Write-Host "`n🚀 Démarrage des microservices..." -ForegroundColor Cyan
podman-compose up -d

Write-Host "`n⏳ Attente de 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Vérifier le statut
Write-Host "`n🔍 Vérification des services..." -ForegroundColor Cyan
podman-compose ps

Write-Host "`n✅ Plateforme démarrée!" -ForegroundColor Green
Write-Host "`nEndpoints disponibles:" -ForegroundColor Yellow
Write-Host "  - API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "  - GraphQL: http://localhost:3000/graphql" -ForegroundColor White
Write-Host "  - Health Check: http://localhost:3000/health" -ForegroundColor White
Write-Host "`nPour voir les logs: podman-compose logs -f" -ForegroundColor Cyan
