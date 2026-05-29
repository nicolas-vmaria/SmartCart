<?php

require_once __DIR__ . '/../controller/ConfiguracoesController.php';

$router->get('/configuracoes',       [ConfiguracoesController::class, 'index']);
$router->put('/admin/configuracoes', [ConfiguracoesController::class, 'update']);
