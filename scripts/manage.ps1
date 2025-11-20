# Scripts PowerShell pour gérer la plateforme

Write-Host "📦 E-Commerce Microservices Platform" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Choisissez une action:" -ForegroundColor Yellow
    Write-Host "1. Démarrer l'infrastructure (PostgreSQL, Kafka, Redis)"
    Write-Host "2. Démarrer tous les services"
    Write-Host "3. Arrêter tous les services"
    Write-Host "4. Voir les logs"
    Write-Host "5. Installer les dépendances"
    Write-Host "6. Build tous les services"
    Write-Host "7. Nettoyer (prune containers/volumes)"
    Write-Host "8. Vérifier le statut des services"
    Write-Host "0. Quitter"
    Write-Host ""
}

function Start-Infrastructure {
    Write-Host "🚀 Démarrage de l'infrastructure..." -ForegroundColor Green
    podman-compose up -d postgres kafka zookeeper redis
    Write-Host "✓ Infrastructure démarrée" -ForegroundColor Green
}

function Start-AllServices {
    Write-Host "🚀 Démarrage de tous les services..." -ForegroundColor Green
    podman-compose up -d
    Write-Host "✓ Tous les services sont démarrés" -ForegroundColor Green
}

function Stop-AllServices {
    Write-Host "🛑 Arrêt de tous les services..." -ForegroundColor Yellow
    podman-compose down
    Write-Host "✓ Services arrêtés" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "📋 Affichage des logs..." -ForegroundColor Cyan
    podman-compose logs -f
}

function Install-Dependencies {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan
    npm run install:all
    Write-Host "✓ Dépendances installées" -ForegroundColor Green
}

function Build-AllServices {
    Write-Host "🔨 Build de tous les services..." -ForegroundColor Cyan
    podman-compose build
    Write-Host "✓ Build terminé" -ForegroundColor Green
}

function Clean-Resources {
    Write-Host "🧹 Nettoyage des ressources..." -ForegroundColor Yellow
    $confirm = Read-Host "Êtes-vous sûr de vouloir nettoyer? (o/n)"
    if ($confirm -eq 'o') {
        podman system prune -af --volumes
        Write-Host "✓ Nettoyage terminé" -ForegroundColor Green
    }
}

function Check-ServicesStatus {
    Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Cyan
    Write-Host ""
    
    $services = @(
        @{Name="API Gateway"; Port=3000},
        @{Name="Clients Service"; Port=3001},
        @{Name="Products Service"; Port=3002},
        @{Name="Orders Service"; Port=3003},
        @{Name="Payments Service"; Port=3004},
        @{Name="Invoices Service"; Port=3005},
        @{Name="Notifications Service"; Port=3006}
    )
    
    foreach ($service in $services) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -TimeoutSec 2 -ErrorAction Stop
            Write-Host "✓ $($service.Name) (Port $($service.Port)): OK" -ForegroundColor Green
        } catch {
            Write-Host "✗ $($service.Name) (Port $($service.Port)): ERREUR" -ForegroundColor Red
        }
    }
}

# Boucle principale
do {
    Show-Menu
    $choice = Read-Host "Votre choix"
    
    switch ($choice) {
        '1' { Start-Infrastructure }
        '2' { Start-AllServices }
        '3' { Stop-AllServices }
        '4' { Show-Logs }
        '5' { Install-Dependencies }
        '6' { Build-AllServices }
        '7' { Clean-Resources }
        '8' { Check-ServicesStatus }
        '0' { 
            Write-Host "Au revoir!" -ForegroundColor Cyan
            exit 
        }
        default { Write-Host "Choix invalide" -ForegroundColor Red }
    }
    
    Write-Host ""
    Read-Host "Appuyez sur Entrée pour continuer"
    Clear-Host
} while ($true)
