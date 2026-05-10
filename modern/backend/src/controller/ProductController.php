<?php

require_once __DIR__ . '/../service/ProductService.php';

class ProductController{
    private ProductService $service;

    public function __construct(){
        $this->service = new ProductService();
    }

    public function index(){
        echo json_encode($this->service->getAllProducts());
    }

    public function show($id){
        echo json_encode($this->service->getProductById($id));
    }
}