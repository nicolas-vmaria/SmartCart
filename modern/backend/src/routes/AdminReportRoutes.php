<?php

require_once __DIR__ . '/../controller/AdminReportController.php';

$router->post('/admin/report', [AdminReportController::class, 'store']);
