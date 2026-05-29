<?php

require_once __DIR__ . '/../controller/AdminCurriculoController.php';

$router->get('/admin/curriculo',          [AdminCurriculoController::class, 'index']);
$router->get('/admin/curriculo/{id}',     [AdminCurriculoController::class, 'show']);
$router->put('/admin/curriculo/{id}',     [AdminCurriculoController::class, 'updateStatus']);
$router->delete('/admin/curriculo/{id}',  [AdminCurriculoController::class, 'destroy']);
