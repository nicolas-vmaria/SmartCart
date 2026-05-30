<?php

require_once __DIR__ . '/../controller/ProfileController.php';

$router->get('/profile', [ProfileController::class, 'index']);
$router->put('/profile', [ProfileController::class, 'update']);
$router->put('/profile/address', [ProfileController::class, 'updateAddress']);
$router->put('/profile/password', [ProfileController::class, 'updatePassword']);
$router->post('/profile/avatar', [ProfileController::class, 'updateAvatar']);