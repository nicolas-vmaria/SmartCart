<?php

require_once __DIR__ . '/../controller/AdminOrderController.php';

$router->get('/admin/order',                   [AdminOrderController::class, 'index']);
$router->get('/admin/order/{id}',              [AdminOrderController::class, 'getOrderById']);
$router->put('/admin/order/{id}/status',       [AdminOrderController::class, 'updateStatus']);
$router->get('/admin/order/analytics/monthly', [AdminOrderController::class, 'analytics']);
