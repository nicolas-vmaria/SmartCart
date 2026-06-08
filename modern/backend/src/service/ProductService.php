<?php

require_once __DIR__ . '/../repository/ProductRepository.php';


class ProductService{
    private ProductRepository $productRepository;

    public function __construct(?ProductRepository $repo = null) {
        $this->productRepository = $repo ?? new ProductRepository();
    }

    public function getHighlights(): array {
    $data = $this->productRepository->getHighlights();

    return [
        'message'      => 'Destaques retornados',
        'best_sellers' => $data['best_sellers'],
        'new_arrivals' => $data['new_arrivals'],
    ];
}

    public function getDestaques(): array {
        $products = $this->productRepository->getDestaques();
        return ['message' => 'Destaques retornados', 'products' => $products];
    }

    public function toggleDestaque(int $id): array {
        $result = $this->productRepository->toggleDestaque($id);
        if (!$result) {
            http_response_code(404);
            return ['error' => "Produto $id não encontrado"];
        }
        return ['message' => 'Destaque atualizado', 'destaque' => (bool)$result['destaque']];
    }

    function getAllProducts(){
        $products = $this->productRepository->getAllProducts();

        return ['message' => "Retornando todos os produtos", 'products' => $products];
    }

    function getProductById(int $id):array{
        $product = $this->productRepository->getProductById($id);

        if (!$product) {
            return ['error' => "Produto com ID $id não encontrado"];
        }

        return [
            'message' => "Produto encontrado",
            'product' => $product
         ];
    }

    function getProductBySlug(string $slug): array {
        $product = $this->productRepository->getProductBySlug($slug);

        if (!$product) {
            return ['error' => "Produto '$slug' não encontrado"];
        }

        return [
            'message' => "Produto encontrado",
            'product' => $product
        ];
    }
}