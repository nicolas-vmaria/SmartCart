<?php

require_once __DIR__ . '/../controller/AdminOrderController.php';

$router->get('/admin/order',                   [AdminOrderController::class, 'index']);
$router->put('/admin/order/{id}/status',       [AdminOrderController::class, 'updateStatus']);
$router->delete('/admin/order/{id}',           [AdminOrderController::class, 'destroy']);
$router->get('/admin/order/analytics/monthly', [AdminOrderController::class, 'analytics']);
