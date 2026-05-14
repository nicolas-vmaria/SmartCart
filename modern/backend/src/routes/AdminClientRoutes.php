<?php

require_once __DIR__ . '/../controller/AdminClientController.php';

$router->get('/admin/client',          [AdminClientController::class, 'index']);
$router->post('/admin/client',         [AdminClientController::class, 'store']);
$router->put('/admin/client/{id}',     [AdminClientController::class, 'update']);
$router->delete('/admin/client/{id}',  [AdminClientController::class, 'destroy']);
