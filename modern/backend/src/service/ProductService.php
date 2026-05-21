<?php

require_once __DIR__ . '/../repository/ProductRepository.php';


class ProductService{
    private ProductRepository $productRepository;

    public function __construct() {
        $this->productRepository = new ProductRepository();
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
}