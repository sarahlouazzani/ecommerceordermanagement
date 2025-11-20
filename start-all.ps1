Param(
    [int]$PostgresWaitSeconds = 12,
    [int]$HealthTimeoutSeconds = 30
)

Write-Host "`n=== ECOMMERCE DEV STACK: FULL START ===" -ForegroundColor Cyan

# 1. Ensure network
if (-not (podman network ls --format "{{.Name}}" | Select-String -Pattern "ecommerce-network" -Quiet)) {
  Write-Host "Creating network 'ecommerce-network'" -ForegroundColor Yellow
  podman network create ecommerce-network | Out-Null
}

# 2. Start/PostgreSQL
if (podman ps --format "{{.Names}}" | Select-String -Pattern "ecommerce-postgres" -Quiet) {
  Write-Host "PostgreSQL already running" -ForegroundColor Green
} else {
  Write-Host "Starting PostgreSQL..." -ForegroundColor Cyan
  podman run -d --name ecommerce-postgres --network ecommerce-network -e POSTGRES_USER=ecommerce -e POSTGRES_PASSWORD=ecommerce123 -e POSTGRES_DB=ecommerce -p 55432:5432 postgres:15-alpine | Out-Null
}

Write-Host "Waiting $PostgresWaitSeconds s for PostgreSQL" -ForegroundColor Yellow
Start-Sleep -Seconds $PostgresWaitSeconds

# 3. Schemas
Write-Host "Ensuring schemas" -ForegroundColor Cyan
$schemaSql = "CREATE SCHEMA IF NOT EXISTS clients; CREATE SCHEMA IF NOT EXISTS products; CREATE SCHEMA IF NOT EXISTS orders; CREATE SCHEMA IF NOT EXISTS payments; CREATE SCHEMA IF NOT EXISTS invoices; CREATE SCHEMA IF NOT EXISTS notifications; GRANT ALL ON SCHEMA clients, products, orders, payments, invoices, notifications TO ecommerce;"
podman exec ecommerce-postgres psql -U ecommerce -d ecommerce -c "$schemaSql" | Out-Null

# 4. Redis
if (-not (podman ps --format "{{.Names}}" | Select-String -Pattern "ecommerce-redis" -Quiet)) {
  Write-Host "Starting Redis..." -ForegroundColor Cyan
  podman run -d --name ecommerce-redis --network ecommerce-network -p 6379:6379 redis:7-alpine | Out-Null
} else { Write-Host "Redis already running" -ForegroundColor Green }

# 5. Zookeeper
if (-not (podman ps --format "{{.Names}}" | Select-String -Pattern "ecommerce-zookeeper" -Quiet)) {
  Write-Host "Starting Zookeeper..." -ForegroundColor Cyan
  podman run -d --name ecommerce-zookeeper --network ecommerce-network -e ZOOKEEPER_CLIENT_PORT=2181 -e ZOOKEEPER_TICK_TIME=2000 -p 22181:2181 confluentinc/cp-zookeeper:7.5.0 | Out-Null
} else { Write-Host "Zookeeper already running" -ForegroundColor Green }

# 6. Kafka
if (-not (podman ps --format "{{.Names}}" | Select-String -Pattern "ecommerce-kafka" -Quiet)) {
  Write-Host "Starting Kafka..." -ForegroundColor Cyan
  podman run -d --name ecommerce-kafka --network ecommerce-network -p 9092:9092 -e KAFKA_BROKER_ID=1 -e KAFKA_ZOOKEEPER_CONNECT=ecommerce-zookeeper:2181 -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT -e KAFKA_LISTENERS=PLAINTEXT://0.0.0.0:9092,PLAINTEXT_INTERNAL://0.0.0.0:29092 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://ecommerce-kafka:29092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:7.5.0 | Out-Null
} else { Write-Host "Kafka already running" -ForegroundColor Green }

# 7. Start services (jobs)
function Start-ServiceJob($name, $path, $port) {
  Write-Host "Starting $name on port $port" -ForegroundColor Magenta
  Start-Job -Name $name -ScriptBlock {
    param($p)
    Set-Location $p
    $env:SERVICE_PORT = $using:port
    npm run dev
  } -InitializationScript { $ErrorActionPreference = 'Continue' } -ArgumentList $path | Out-Null
}

Start-ServiceJob "gateway" "$(Join-Path $PWD 'gateway')" 3000
Start-ServiceJob "clients" "$(Join-Path $PWD 'services/clients-service')" 3001
Start-ServiceJob "products" "$(Join-Path $PWD 'services/products-service')" 3002
Start-ServiceJob "orders" "$(Join-Path $PWD 'services/orders-service')" 3003
Start-ServiceJob "payments" "$(Join-Path $PWD 'services/payments-service')" 3004
Start-ServiceJob "invoices" "$(Join-Path $PWD 'services/invoices-service')" 3005
Start-ServiceJob "notifications" "$(Join-Path $PWD 'services/notifications-service')" 3006

Write-Host "Services launching..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# 8. Health poll
Write-Host "Polling gateway health..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds($HealthTimeoutSeconds)
$healthy = $false
while ((Get-Date) -lt $deadline) {
  try {
    $resp = Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing -TimeoutSec 4
    if ($resp.StatusCode -eq 200) {
      Write-Host "Gateway health OK" -ForegroundColor Green
      $healthy = $true
      break
    }
  } catch { Start-Sleep -Milliseconds 800 }
}
if (-not $healthy) { Write-Host "Gateway health NOT reachable within timeout" -ForegroundColor Red }

Write-Host "Jobs summary:" -ForegroundColor Cyan
Get-Job | Select-Object Name, State | Format-Table

Write-Host "=== Stack start sequence complete ===" -ForegroundColor Cyan
