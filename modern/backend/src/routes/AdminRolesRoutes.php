<?php

require_once __DIR__ . '/../controller/AdminRolesController.php';

$router->get('/admin/role',         [AdminRolesController::class, 'index']);
$router->post('/admin/role',        [AdminRolesController::class, 'store']);
$router->put('/admin/role/{id}',    [AdminRolesController::class, 'update']);
$router->delete('/admin/role/{id}', [AdminRolesController::class, 'destroy']);
