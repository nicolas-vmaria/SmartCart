<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../service/AdminCategoryService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminCategoryController extends BaseController {
    private AdminCategoryService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_categorias');
        $this->service = new AdminCategoryService();
    }

    public function index() {
        $result = $this->service->getAllCategories();
        $this->respond($result);
    }

    public function store() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createCategory($body);
        $this->respond($result, 201);
    }

    public function update(string $id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateCategory($id, $body);
        $this->respond($result);
}

    public function destroy(string $id) {
        $result = $this->service->deleteCategory($id);
        $this->respond($result);    
    }
}
