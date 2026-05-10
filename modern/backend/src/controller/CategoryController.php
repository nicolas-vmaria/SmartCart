<?php

require_once __DIR__ . '/../service/CategoryService.php';

class CategoryController {
    private CategoryService $service;

    public function __construct() {
        $this->service = new CategoryService();
    }

    public function index() {
        echo json_encode($this->service->getAllCategories());
    }

    public function show($slug) {
        echo json_encode($this->service->getCategoryBySlug($slug));
    }
}
