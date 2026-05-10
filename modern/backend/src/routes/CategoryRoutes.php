<?php

require_once __DIR__ . '/../controller/CategoryController.php';

$router->get('/category',        [CategoryController::class, 'index']);
$router->get('/category/{slug}', [CategoryController::class, 'show']);
