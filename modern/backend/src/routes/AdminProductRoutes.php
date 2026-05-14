<?php

require_once __DIR__ . '/../controller/AdminProductController.php';

$router->get('/admin/product',         [AdminProductController::class, 'index']);
$router->post('/admin/product',        [AdminProductController::class, 'store']);
$router->put('/admin/product/{id}',    [AdminProductController::class, 'update']);
$router->delete('/admin/product/{id}', [AdminProductController::class, 'destroy']);
