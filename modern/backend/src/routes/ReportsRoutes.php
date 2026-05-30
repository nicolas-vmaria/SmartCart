<?php 

require_once __DIR__ . '/../controller/ReportsController.php';

$router->get('/admin/reports/info/{period}', [ReportsController::class, 'showInfo']);
$router->get('/admin/reports/graphic/{period}', [ReportsController::class, 'showGraphic']);
$router->get('/admin/reports/products/{period}', [ReportsController::class, 'showProducts']);
