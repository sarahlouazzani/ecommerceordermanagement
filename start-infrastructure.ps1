# Script de démarrage simple pour Windows

Write-Host "`n🚀 Démarrage de la plateforme E-Commerce" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Arrêter les anciens conteneurs
Write-Host "📦 Nettoyage des anciens conteneurs..." -ForegroundColor Yellow
podman stop ecommerce-postgres ecommerce-redis ecommerce-kafka ecommerce-zookeeper 2>$null
podman rm ecommerce-postgres ecommerce-redis 2>$null

# Démarrer PostgreSQL
Write-Host "`n🐘 Démarrage de PostgreSQL..." -ForegroundColor Cyan
podman run -d --name ecommerce-postgres `
  -e POSTGRES_USER=ecommerce `
  -e POSTGRES_PASSWORD=ecommerce123 `
  -e POSTGRES_DB=ecommerce `
  -p 55432:5432 `
  postgres:15-alpine

Write-Host "Attente de PostgreSQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Créer les schémas nécessaires
Write-Host "`n📊 Configuration de la base de données..." -ForegroundColor Cyan
podman exec ecommerce-postgres psql -U ecommerce -d ecommerce -c "CREATE SCHEMA IF NOT EXISTS clients; CREATE SCHEMA IF NOT EXISTS products; CREATE SCHEMA IF NOT EXISTS orders; CREATE SCHEMA IF NOT EXISTS payments; CREATE SCHEMA IF NOT EXISTS invoices;"
podman exec ecommerce-postgres psql -U ecommerce -d ecommerce -c "GRANT ALL ON SCHEMA clients, products, orders, payments, invoices TO ecommerce;"

# Démarrer Redis
Write-Host "`n🔴 Démarrage de Redis..." -ForegroundColor Cyan
podman run -d --name ecommerce-redis -p 6379:6379 redis:7-alpine

Write-Host "`n✅ Infrastructure démarrée!" -ForegroundColor Green
Write-Host "`n📊 Services disponibles:" -ForegroundColor Cyan
Write-Host "  - PostgreSQL: localhost:55432 (user: ecommerce, pass: ecommerce123)" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host "  - Kafka: localhost:9092 (déjà en cours)" -ForegroundColor White

Write-Host "`n🚀 Démarrage des microservices..." -ForegroundColor Cyan
Write-Host "  Ouvrez des terminaux séparés pour chaque service:" -ForegroundColor Yellow
Write-Host "`n  Terminal 1 - API Gateway:" -ForegroundColor White
Write-Host "    cd gateway ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 2 - Clients Service:" -ForegroundColor White
Write-Host "    cd services\clients-service ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 3 - Products Service:" -ForegroundColor White
Write-Host "    cd services\products-service ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 4 - Orders Service:" -ForegroundColor White
Write-Host "    cd services\orders-service ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 5 - Payments Service:" -ForegroundColor White
Write-Host "    cd services\payments-service ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 6 - Invoices Service:" -ForegroundColor White
Write-Host "    cd services\invoices-service ; npm run dev" -ForegroundColor Gray
Write-Host "`n  Terminal 7 - Notifications Service:" -ForegroundColor White
Write-Host "    cd services\notifications-service ; npm run dev" -ForegroundColor Gray

Write-Host "`n✨ Pour tout démarrer automatiquement, les microservices ont besoin de Kafka." -ForegroundColor Yellow
Write-Host "   L'API Gateway fonctionne déjà sur http://localhost:3000`n" -ForegroundColor Green
