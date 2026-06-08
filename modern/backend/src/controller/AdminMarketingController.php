<?php

require_once __DIR__ . '/../service/ProductService.php';
require_once __DIR__ . '/../repository/AuditRepository.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminMarketingController extends BaseController {
    private ProductService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_marketing');
        $this->service = new ProductService();
    }

    public function toggleDestaque(string $id) {
        $result = $this->service->toggleDestaque((int)$id);
        AuditRepository::log((int)$this->admin['userId'], $this->admin['nome'], 'toggle_destaque', 'produto', (int)$id);
        $this->respond($result);
    }
}
