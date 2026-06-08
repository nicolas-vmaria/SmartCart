<?php

require_once __DIR__ . '/../service/AdminAuditService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminAuditController extends BaseController {
    private AdminAuditService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_auditoria');
        $this->service = new AdminAuditService();
    }

    public function index(): void {
        $this->respond($this->service->getLogs($_GET));
    }
}
