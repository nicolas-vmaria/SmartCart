<?php

require_once __DIR__ . '/../controller/ProductController.php';

$router->get('/product/destaques',  [ProductController::class, 'destaques']);
$router->get('/product/highlights', [ProductController::class, 'highlights']);
$router->get('/product', [ProductController::class, 'index']);
$router->get('/product/{id}', [ProductController::class, 'show']);