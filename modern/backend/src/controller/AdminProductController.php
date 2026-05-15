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
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->createProduct($body);
        if (is_array($result) && isset($result['message']) && !isset($result['error'])) {
            http_response_code(201);
        }
        echo json_encode($result);
    }

    public function update(string $id) {
        echo json_encode($this->service->updateProduct($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteProduct($id));
    }
}
