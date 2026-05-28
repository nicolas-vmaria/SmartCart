<?php

require_once __DIR__ . '/../service/CompraJuntoService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class CompraJuntoController extends BaseController {
    private CompraJuntoService $service;

    public function __construct() {
        $this->service = new CompraJuntoService();
    }

    public function show(string $id) {
        $this->respond($this->service->getByProduto((int)$id));
    }

    public function index() {
        AuthMiddleware::handle('admin', 'ver_marketing');
        $this->respond($this->service->getAll());
    }

    public function set() {
        AuthMiddleware::handle('admin', 'ver_marketing');
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido']);
            return;
        }
        $this->respond($this->service->set($body));
    }

    public function remove(string $produtoId) {
        AuthMiddleware::handle('admin', 'ver_marketing');
        $this->respond($this->service->delete((int)$produtoId));
    }
}
