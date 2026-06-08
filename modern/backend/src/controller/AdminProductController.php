<?php

require_once __DIR__ . '/../service/AdminProductService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminProductController extends BaseController {
    private AdminProductService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_produtos');
        $this->service = new AdminProductService();
    }

    public function index() {
        $result = $this->service->getAllProducts();

        if (isset($result['error'])) {
            http_response_code(500);
            echo json_encode(['error' => $result['error']]);
            return;
        }

        $this->respond($result);
    }

    public function store() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createProduct($body, $this->admin);
        $this->respond($result, 201);
    }

    public function update(string $id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateProduct($id, $body, $this->admin);
        $this->respond($result);
    }

    public function destroy(string $id) {
        $result = $this->service->deleteProduct($id, $this->admin);
        $this->respond($result);
    }
}
