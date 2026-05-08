<?php

require_once __DIR__ . '/../controller/HealthController.php';

$router->get('/', [HealthController::class, 'index']);