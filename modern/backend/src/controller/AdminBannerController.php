<?php

require_once __DIR__ . '/../service/AdminBannerService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminBannerController extends BaseController {
    private AdminBannerService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_customizacao');
        $this->service = new AdminBannerService();
    }

    public function index() {
        $this->respond($this->service->getAll());
    }

    public function store() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->create($body, $this->admin), 201);
    }

    public function destroy(string $id) {
        $this->respond($this->service->delete((int)$id, $this->admin));
    }

    public function reorder() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->reorder($body, $this->admin));
    }

    public function toggle(string $id) {
        $this->respond($this->service->toggleAtivo((int)$id, $this->admin));
    }
}
