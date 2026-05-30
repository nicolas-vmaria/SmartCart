<?php

require_once __DIR__ . '/../controller/AdminMarketingController.php';

$router->put('/admin/marketing/destaque/{id}', [AdminMarketingController::class, 'toggleDestaque']);
