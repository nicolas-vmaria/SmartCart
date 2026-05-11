# SmartCart Backend - Script de inicialização
# Uso: ./start.ps1

$PORT = 3001

# 1. Encontra o php.ini ativo
$iniPath = (php --ini | Select-String "Loaded Configuration File") -replace "Loaded Configuration File:\s+", ""

if (-not $iniPath -or -not (Test-Path $iniPath)) {
    Write-Host "ERRO: php.ini nao encontrado. Verifique sua instalacao do PHP." -ForegroundColor Red
    exit 1
}

Write-Host "php.ini: $iniPath" -ForegroundColor DarkGray

# 2. Habilita a extensao OpenSSL se estiver comentada
$ini = Get-Content $iniPath -Raw
if ($ini -match "^;extension=openssl") {
    Write-Host "Habilitando extensao OpenSSL..." -ForegroundColor Yellow
    $ini -replace "(?m)^;extension=openssl", "extension=openssl" | Set-Content $iniPath -Encoding UTF8
    Write-Host "OpenSSL habilitado." -ForegroundColor Green
} else {
    Write-Host "OpenSSL ja esta habilitado." -ForegroundColor DarkGray
}

# 3. Instala dependencias se vendor nao existir
if (-not (Test-Path "vendor")) {
    Write-Host "Instalando dependencias (composer install)..." -ForegroundColor Yellow
    composer install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERRO: composer install falhou." -ForegroundColor Red
        exit 1
    }
}

# 4. Verifica se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "AVISO: arquivo .env nao encontrado. Copie o .env.example e configure." -ForegroundColor Yellow
}

# 5. Sobe o servidor
Write-Host ""
Write-Host "Servidor iniciado em http://localhost:$PORT" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar." -ForegroundColor DarkGray
Write-Host ""
php -S "localhost:$PORT" -t public/
