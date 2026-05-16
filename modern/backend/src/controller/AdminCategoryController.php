<?php

require_once __DIR__ . '/../service/AdminCategoryService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminCategoryController {
    private AdminCategoryService $service;

    public function __construct() {
        AuthMiddleware::handle();
        $this->service = new AdminCategoryService();
    }

    public function index() {
        echo json_encode($this->service->getAllCategories());
    }

    public function store() {
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->createCategory($body);
        if (is_array($result) && isset($result['message']) && !isset($result['error'])) {
            http_response_code(201);
        }
        echo json_encode($result);
    }

    public function update(string $id) {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!is_array($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
        return;
    }

    echo json_encode($this->service->updateCategory($id, $body));
}

    public function destroy(string $id) {
        $result = $this->service->deleteCategory($id);

        if(!isset($result['error'])){
            http_response_code(200);
        }

        echo json_encode($result);
    }
}
