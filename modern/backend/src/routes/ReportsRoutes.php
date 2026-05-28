<?php 


require_once __DIR__ . '/../controllers/ReportsController.php';

$router->get('/reports/info/{period}', [ReportsController::class, 'showInfo']);
$router->get('/reports/graphic/{period}', [ReportsController::class, 'showGraphic']);
$router->get('/reports/products/{period}', [ReportsController::class, 'showProducts']);
