<?php

require_once __DIR__ . '/../controller/AdminDashboardController.php';

$router->get('/admin/dashboard', [AdminDashboardController::class, 'index']);
