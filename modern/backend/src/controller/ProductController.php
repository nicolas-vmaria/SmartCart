<?php

require_once __DIR__ . '/../service/ProductService.php';
require_once __DIR__ . '/BaseController.php';


class ProductController extends BaseController {
    private ProductService $service;

    public function __construct(){
        $this->service = new ProductService();
    }

    public function destaques(): void {
        $this->respond($this->service->getDestaques());
    }

    public function highlights(): void {
    $respond = $this->service->getHighlights();
    $this->respond($respond);
    }

    public function index(){
        $respond = $this->service->getAllProducts();
        
        if (isset($respond['error'])) {
            http_response_code(500);
            echo json_encode(['error' => $respond['error']]);
            return;
        }
        
        $this->respond($respond);
    }

    public function show(string $id){
        if (ctype_digit($id)) {
            $respond = $this->service->getProductById((int)$id);
        } else {
            $respond = $this->service->getProductBySlug($id);
        }

        if (isset($respond['error'])) {
            http_response_code(404);
            echo json_encode(['error' => $respond['error']]);
            return;
        }

        $this->respond($respond);
    }
}