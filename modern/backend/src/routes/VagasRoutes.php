<?php

require_once __DIR__ . '/../controller/VagasController.php';

$router->get('/vagas', [VagasController::class, 'index']);
