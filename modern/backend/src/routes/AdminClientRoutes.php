<?php

require_once __DIR__ . '/../controller/AdminClientController.php';

$router->get('/admin/client',          [AdminClientController::class, 'index']);
$router->delete('/admin/client/{id}',  [AdminClientController::class, 'destroy']);
