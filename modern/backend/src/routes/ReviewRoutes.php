<?php

require_once __DIR__ . '/../controller/ReviewController.php';

$router->get('/product/{id}/review',      [ReviewController::class, 'index']);
$router->post('/product/{id}/review',     [ReviewController::class, 'store']);
$router->put('/review/{id}/helpful',      [ReviewController::class, 'helpful']);
