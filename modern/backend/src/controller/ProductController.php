<?php

require_once __DIR__ . '/../service/ProductService.php';
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';


class ProductController extends BaseController {
    private ProductService $service;

    public function __construct(){
        AuthMiddleware::handle(); // Protege todas as rotas deste controlador
        $this->service = new ProductService();
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

    public function show(int $id){
        $respond = $this->service->getProductById($id);
        
        if (isset($respond['error'])) {
            http_response_code(404);
            echo json_encode(['error' => $respond['error']]);
            return;
        }
        
        $this->respond($respond);
    }
}