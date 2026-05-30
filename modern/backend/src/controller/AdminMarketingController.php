<?php

require_once __DIR__ . '/../service/ProductService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminMarketingController extends BaseController {
    private ProductService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_marketing');
        $this->service = new ProductService();
    }

    public function toggleDestaque(string $id) {
        $this->respond($this->service->toggleDestaque((int)$id));
    }
}
