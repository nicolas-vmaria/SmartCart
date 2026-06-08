<?php

require_once __DIR__ . '/../controller/AdminAuditController.php';

$router->get('/admin/auditoria', [AdminAuditController::class, 'index']);
