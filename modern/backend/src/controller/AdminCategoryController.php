<?php

require_once __DIR__ . '/../service/AdminCategoryService.php';

class AdminCategoryController {
    private AdminCategoryService $service;

    public function __construct() {
        $this->service = new AdminCategoryService();
    }

    public function index() {
        echo json_encode($this->service->getAllCategories());
    }

    public function store() {
        echo json_encode($this->service->createCategory());
    }

    public function update($id) {
        echo json_encode($this->service->updateCategory($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteCategory($id));
    }
}
