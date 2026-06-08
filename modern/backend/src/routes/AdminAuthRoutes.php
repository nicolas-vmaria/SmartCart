<?php

require_once __DIR__ . '/../controller/AdminAuthController.php';

$router->post('/admin/auth/login',  [AdminAuthController::class, 'login']);
$router->post('/admin/auth/logout', [AdminAuthController::class, 'logout']);
