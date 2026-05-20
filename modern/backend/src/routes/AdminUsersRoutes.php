<?php

require_once __DIR__ . '/../controller/AdminUsersController.php';

$router->get('/admin/user',                      [AdminUsersController::class, 'index']);
$router->post('/admin/user',                     [AdminUsersController::class, 'store']);
$router->put('/admin/user/{id}',                 [AdminUsersController::class, 'update']);
$router->delete('/admin/user/{id}',              [AdminUsersController::class, 'destroy']);
$router->put('/admin/user/{id}/reset-password',  [AdminUsersController::class, 'resetPassword']);
