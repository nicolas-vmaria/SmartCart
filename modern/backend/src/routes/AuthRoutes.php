<?php

require_once __DIR__ . '/../controller/AuthController.php';

$router->post('/auth/login',           [AuthController::class, 'login']);
$router->post('/auth/register',        [AuthController::class, 'register']);
$router->post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
$router->post('/auth/reset-password',  [AuthController::class, 'resetPassword']);
