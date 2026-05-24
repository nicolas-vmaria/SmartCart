<?php

require_once __DIR__ . '/../service/AdminUsersService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminUsersController extends BaseController {
    private AdminUsersService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_usuarios');
        $this->service = new AdminUsersService();
    }

    public function index() {
        $this->respond($this->service->getAllUsers());
    }

    public function store() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->createUser($body), 201);
    }

    public function update(string $id) {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->updateUser((int)$id, $body));
    }

    public function destroy(string $id) {
        $this->respond($this->service->deleteUser((int)$id));
    }

    public function resetPassword(string $id) {
        $this->respond($this->service->resetPassword((int)$id));
    }
}
