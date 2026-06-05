<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->safeLoad();

if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', 'php://stderr');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    error_reporting(0);
}

header("Access-Control-Allow-Origin: " . ($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173'));
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Core
require_once __DIR__ . '/../src/Core/Router.php';

// Routes
require_once __DIR__ . '/../src/routes/HealthRoutes.php';
require_once __DIR__ . '/../src/routes/AuthRoutes.php';
require_once __DIR__ . '/../src/routes/ProfileRoutes.php';
require_once __DIR__ . '/../src/routes/ProductRoutes.php';
require_once __DIR__ . '/../src/routes/CategoryRoutes.php';
require_once __DIR__ . '/../src/routes/OrderRoutes.php';
require_once __DIR__ . '/../src/routes/ReviewRoutes.php';
require_once __DIR__ . '/../src/routes/CartRoutes.php';
require_once __DIR__ . '/../src/routes/CouponRoutes.php';
require_once __DIR__ . '/../src/routes/ContactRoutes.php';
require_once __DIR__ . '/../src/routes/BannerRoutes.php';
require_once __DIR__ . '/../src/routes/ConfiguracoesRoutes.php';
require_once __DIR__ . '/../src/routes/AdminMarketingRoutes.php';
require_once __DIR__ . '/../src/routes/CompraJuntoRoutes.php';
require_once __DIR__ . '/../src/routes/VagasRoutes.php';
require_once __DIR__ . '/../src/routes/CandidacyRoutes.php';
require_once __DIR__ . '/../src/routes/AdminRoutes.php';
require_once __DIR__ . '/../src/routes/ReportsRoutes.php';


// Dispara o roteador
$router->dispatch();