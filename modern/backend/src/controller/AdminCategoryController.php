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
        echo json_encode($this->service->createCategory());
    }

    public function update(string $id) {
        echo json_encode($this->service->updateCategory($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteCategory($id));
    }
}
