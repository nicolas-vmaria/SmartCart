<?php

require_once __DIR__ . '/../service/AdminProductService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminProductController {
    private AdminProductService $service;

    public function __construct() {
        AuthMiddleware::handle();
        $this->service = new AdminProductService();
    }

    public function index() {
        echo json_encode($this->service->getAllProducts());
    }

    public function store() {
        echo json_encode($this->service->createProduct());
    }

    public function update(string $id) {
        echo json_encode($this->service->updateProduct($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteProduct($id));
    }
}
