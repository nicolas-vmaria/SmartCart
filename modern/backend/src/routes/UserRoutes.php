<?php

require_once __DIR__ . '/../controller/UserController.php';

$router->get('/user', [UserController::class, 'index']);
$router->get('/user/{id}', [UserController::class, 'show']);
$router->post('/user', [UserController::class, 'store']);
$router->put('/user/{id}', [UserController::class, 'update']);
$router->delete('/user/{id}', [UserController::class, 'destroy']);
