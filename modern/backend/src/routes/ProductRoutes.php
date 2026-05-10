<?php

require_once __DIR__ . '/../controller/ProductController.php';

$router->get('/product', [ProductController::class, 'index']);
$router->get('/product/{id}', [ProductController::class, 'show']);