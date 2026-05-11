# SmartCart — Configuração do XAMPP (rodar uma vez)
# Uso: ./setup-xampp.ps1

$XAMPP    = "C:\xampp"
$PORT     = 3001
$ROOT     = (Resolve-Path ".\public").Path -replace '\\', '/'
$VHOSTS   = "$XAMPP\apache\conf\extra\httpd-vhosts.conf"
$HTTPCONF = "$XAMPP\apache\conf\httpd.conf"

# Verifica XAMPP
if (-not (Test-Path $XAMPP)) {
    Write-Host "ERRO: XAMPP nao encontrado em $XAMPP" -ForegroundColor Red
    exit 1
}

# 1. Habilita mod_rewrite, mod_headers e include de vhosts no httpd.conf
$http = Get-Content $HTTPCONF -Raw
$changed = $false

foreach ($mod in @("mod_rewrite", "mod_headers")) {
    if ($http -match "(?m)^#LoadModule ${mod}_module") {
        $http = $http -replace "(?m)^#LoadModule ${mod}_module", "LoadModule ${mod}_module"
        $changed = $true
        Write-Host "$mod habilitado." -ForegroundColor Green
    }
}

if ($http -match "(?m)^#Include conf/extra/httpd-vhosts.conf") {
    $http = $http -replace "(?m)^#Include conf/extra/httpd-vhosts.conf", "Include conf/extra/httpd-vhosts.conf"
    $changed = $true
    Write-Host "VirtualHosts habilitado." -ForegroundColor Green
}

# 2. Adiciona Listen 3001 no httpd.conf (lugar certo)
if ($http -notmatch "Listen $PORT") {
    $http = $http + "`n`nListen $PORT`n"
    $changed = $true
    Write-Host "Listen $PORT adicionado ao httpd.conf." -ForegroundColor Green
}

if ($changed) {
    $http | Set-Content $HTTPCONF -Encoding UTF8
}

# 3. Limpa entradas antigas do SmartCart no vhosts e reescreve corretamente
$vhostsContent = Get-Content $VHOSTS -Raw

# Remove bloco antigo se existir (garante que nao fique duplicado ou corrompido)
$vhostsContent = $vhostsContent -replace "(?s)# SmartCart Backend.*?</VirtualHost>", ""

$block = @"

# SmartCart Backend
<VirtualHost *:$PORT>
    DocumentRoot "$ROOT"
    <Directory "$ROOT">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
"@

$vhostsContent + $block | Set-Content $VHOSTS -Encoding UTF8
Write-Host "VirtualHost na porta $PORT configurado." -ForegroundColor Green

# 4. Instala dependencias PHP
if (-not (Test-Path "vendor")) {
    Write-Host "Rodando composer install..." -ForegroundColor Yellow
    composer install
}

# 5. Reinicia Apache
Write-Host "Reiniciando Apache..." -ForegroundColor Yellow
Start-Process "$XAMPP\apache_stop.bat"  -WindowStyle Hidden
Start-Sleep -Seconds 2
Start-Process "$XAMPP\apache_start.bat" -WindowStyle Hidden
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Pronto! Acesse http://localhost:$PORT" -ForegroundColor Green
