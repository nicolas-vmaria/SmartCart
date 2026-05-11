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

# 1. Habilita mod_rewrite e mod_headers no httpd.conf
$http = Get-Content $HTTPCONF -Raw
$changed = $false

foreach ($mod in @("mod_rewrite", "mod_headers")) {
    if ($http -match "#LoadModule ${mod}_module") {
        $http = $http -replace "#LoadModule ${mod}_module", "LoadModule ${mod}_module"
        $changed = $true
        Write-Host "$mod habilitado." -ForegroundColor Green
    }
}

# 2. Habilita include de vhosts
if ($http -match "#Include conf/extra/httpd-vhosts.conf") {
    $http = $http -replace "#Include conf/extra/httpd-vhosts.conf", "Include conf/extra/httpd-vhosts.conf"
    $changed = $true
    Write-Host "VirtualHosts habilitado." -ForegroundColor Green
}

if ($changed) {
    $http | Set-Content $HTTPCONF -Encoding UTF8
}

# 3. Adiciona Listen e VirtualHost se ainda nao existir
$vhostsContent = Get-Content $VHOSTS -Raw

if ($vhostsContent -notmatch "VirtualHost \*:$PORT") {
    $block = @"

# SmartCart Backend
Listen $PORT
<VirtualHost *:$PORT>
    DocumentRoot "$ROOT"
    <Directory "$ROOT">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
"@
    Add-Content $VHOSTS $block
    Write-Host "VirtualHost na porta $PORT adicionado." -ForegroundColor Green
} else {
    Write-Host "VirtualHost na porta $PORT ja existe." -ForegroundColor DarkGray
}

# 4. Instala dependencias PHP
if (-not (Test-Path "vendor")) {
    Write-Host "Rodando composer install..." -ForegroundColor Yellow
    composer install
}

Write-Host ""
Write-Host "Setup concluido!" -ForegroundColor Green
Write-Host "Agora use ./start-xampp.ps1 para iniciar." -ForegroundColor Cyan
