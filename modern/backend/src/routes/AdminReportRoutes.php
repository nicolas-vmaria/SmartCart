<?php

require_once __DIR__ . '/../controller/AdminReportController.php';

$router->get('/admin/report', [AdminReportController::class, 'index']);
$router->get('/admin/report/{id}', [AdminReportController::class, 'show']);
$router->post('/admin/report', [AdminReportController::class, 'store']);
$router->put('/admin/report/{id}', [AdminReportController::class, 'update']);
