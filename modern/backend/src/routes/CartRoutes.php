<?php

require_once __DIR__ . '/../controller/CartController.php';

$router->get('/cart',               [CartController::class, 'index']);
$router->post('/cart/item',         [CartController::class, 'addItem']);
$router->put('/cart/item/{id}',     [CartController::class, 'updateItem']);
$router->delete('/cart/item/{id}',  [CartController::class, 'removeItem']);
$router->delete('/cart',            [CartController::class, 'clear']);
