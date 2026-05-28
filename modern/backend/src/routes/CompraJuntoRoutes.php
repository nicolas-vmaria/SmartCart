<?php

require_once __DIR__ . '/../controller/CompraJuntoController.php';

$router->get('/produto/{id}/compra-junto',   [CompraJuntoController::class, 'show']);
$router->get('/admin/compra-junto',          [CompraJuntoController::class, 'index']);
$router->put('/admin/compra-junto',          [CompraJuntoController::class, 'set']);
$router->delete('/admin/compra-junto/{id}',  [CompraJuntoController::class, 'remove']);
