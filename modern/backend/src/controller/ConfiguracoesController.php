<?php

require_once __DIR__ . '/../service/ConfiguracoesService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class ConfiguracoesController extends BaseController {
    private ConfiguracoesService $service;

    public function __construct() {
        $this->service = new ConfiguracoesService();
    }

    public function index() {
        $this->respond($this->service->getAll());
    }

    public function update() {
        AuthMiddleware::handle('admin');
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->update($body));
    }
}
