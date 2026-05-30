<?php

require_once __DIR__ . '/../service/CategoryService.php';
require_once __DIR__ . '/BaseController.php';

class CategoryController extends BaseController {
    private CategoryService $service;

    public function __construct() {
        $this->service = new CategoryService();
    }

    public function index(): void {
        $result = $this->service->getAllCategories();
        $code   = isset($result['error']) ? ($result['code'] ?? 400) : 200;
        unset($result['code']);
        $this->respond($result, $code);
    }

    public function show(string $slug): void {
        $result = $this->service->getCategoryBySlug($slug);
        $code   = isset($result['error']) ? ($result['code'] ?? 400) : 200;
        unset($result['code']);
        $this->respond($result, $code);
    }
}