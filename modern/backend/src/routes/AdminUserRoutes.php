<?php

require_once __DIR__ . '/../controller/AdminUserController.php';

$router->get('/admin/user',            [AdminUserController::class, 'index']);
$router->put('/admin/user/{id}/role',  [AdminUserController::class, 'updateRole']);
$router->delete('/admin/user/{id}',    [AdminUserController::class, 'destroy']);
$router->get('/admin/role',            [AdminUserController::class, 'roles']);
$router->post('/admin/role',           [AdminUserController::class, 'storeRole']);
$router->put('/admin/role/{id}',       [AdminUserController::class, 'updateRole']);
$router->delete('/admin/role/{id}',    [AdminUserController::class, 'destroyRole']);
