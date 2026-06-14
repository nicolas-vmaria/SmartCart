<?php

require_once __DIR__ . '/../controller/AdminPushTokenController.php';

$router->post('/admin/push-token', [AdminPushTokenController::class, 'save']);
