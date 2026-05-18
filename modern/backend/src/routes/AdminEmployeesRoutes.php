<?php

require_once __DIR__ . '/../controller/AdminEmployeesController.php';

$router->get('/admin/employee',           [AdminEmployeesController::class, 'index']);
$router->post('/admin/employee',          [AdminEmployeesController::class, 'store']);
$router->put('/admin/employee/{id}', [AdminEmployeesController::class, 'update']);
$router->delete('/admin/employee/{id}',   [AdminEmployeesController::class, 'destroy']);
$router->put('/admin/employee/{id}/reset-password', [AdminEmployeesController::class, 'resetPassword']);