<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Responde requisições OPTIONS (preflight do CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Core
require_once __DIR__ . '/../src/Core/Router.php';

// Routes
require_once __DIR__ . '/../src/routes/HealthRoutes.php';
require_once __DIR__ . '/../src/routes/AuthRoutes.php';
require_once __DIR__ . '/../src/routes/UserRoutes.php';
require_once __DIR__ . '/../src/routes/ProductRoutes.php';
require_once __DIR__ . '/../src/routes/CategoryRoutes.php';
require_once __DIR__ . '/../src/routes/OrderRoutes.php';
require_once __DIR__ . '/../src/routes/ReviewRoutes.php';
require_once __DIR__ . '/../src/routes/CartRoutes.php';
require_once __DIR__ . '/../src/routes/CouponRoutes.php';
require_once __DIR__ . '/../src/routes/ContactRoutes.php';
require_once __DIR__ . '/../src/routes/AdminRoutes.php';


// Dispara o roteador
$router->dispatch();