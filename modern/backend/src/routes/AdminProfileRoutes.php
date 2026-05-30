<?php

require_once __DIR__ . '/../controller/AdminProfileController.php';

$router->get('/admin/profile',          [AdminProfileController::class, 'show']);
$router->put('/admin/profile',          [AdminProfileController::class, 'update']);
$router->put('/admin/profile/password', [AdminProfileController::class, 'changePassword']);
