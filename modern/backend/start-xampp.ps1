# SmartCart — Iniciar com XAMPP
# Uso: ./start-xampp.ps1

$XAMPP = "C:\xampp"

if (-not (Test-Path $XAMPP)) {
    Write-Host "ERRO: XAMPP nao encontrado em $XAMPP" -ForegroundColor Red
    exit 1
}

Write-Host "Iniciando Apache..." -ForegroundColor Yellow
Start-Process "$XAMPP\apache_start.bat" -WindowStyle Hidden

Write-Host "Iniciando MySQL..." -ForegroundColor Yellow
Start-Process "$XAMPP\mysql_start.bat" -WindowStyle Hidden

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Pronto!" -ForegroundColor Green
Write-Host "Backend  -> http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend -> rode 'npm run dev' em modern/frontend" -ForegroundColor Cyan
