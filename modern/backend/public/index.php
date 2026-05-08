<?php

// Headers CORS
header("Access-Control-Allow-Origin: http://localhost:5173"); // URL do React
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
require_once __DIR__ . '/../src/routes/UserRoutes.php';
require_once __DIR__ . '/../src/routes/HealthRoutes.php';


// Dispara o roteador
$router->dispatch();