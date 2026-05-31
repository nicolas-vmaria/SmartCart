<?php

require_once __DIR__ . '/../controller/OrderController.php';

$router->get('/order',               [OrderController::class, 'index']);
$router->get('/order/{id}',          [OrderController::class, 'show']);
$router->post('/order',              [OrderController::class, 'store']);
$router->delete('/order/{id}',       [OrderController::class, 'destroy']);
$router->get('/order/{id}/tracking',      [OrderController::class, 'tracking']);
$router->get('/order/{id}/review-items',  [OrderController::class, 'reviewItems']);