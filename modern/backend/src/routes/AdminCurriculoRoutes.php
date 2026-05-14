<?php

require_once __DIR__ . '/../controller/AdminCurriculoController.php';

$router->get('/admin/curriculo',          [AdminCurriculoController::class, 'index']);
$router->put('/admin/curriculo/{id}',     [AdminCurriculoController::class, 'updateStatus']);
$router->delete('/admin/curriculo/{id}',  [AdminCurriculoController::class, 'destroy']);
