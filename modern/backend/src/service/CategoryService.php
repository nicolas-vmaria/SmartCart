<?php

require_once __DIR__ . '/../repository/CategoryRepository.php';

class CategoryService {
    private CategoryRepository $repo;

    public function __construct(?CategoryRepository $repo = null) {
        $this->repo = $repo ?? new CategoryRepository();
    }

    public function getAllCategories(): array {
        $categories = $this->repo->findAll();

        if (empty($categories)) {
            return ['error' => 'Nenhuma categoria encontrada', 'code' => 404];
        }

        return ['data' => $categories];
    }

    public function getCategoryBySlug(string $slug): array {
        $category = $this->repo->findBySlug($slug);

        if (!$category) {
            return ['error' => 'Categoria não encontrada', 'code' => 404];
        }

        $products = $this->repo->findProductsBySlug($slug);

        return [
            'data' => [
                'categoria' => $category,
                'produtos'  => $products,
            ]
        ];
    }
}