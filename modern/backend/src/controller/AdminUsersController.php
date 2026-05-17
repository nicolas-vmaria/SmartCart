<?php

require_once __DIR__ . '/../service/AdminUsersService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminUsersController extends BaseController {
    private AdminUsersService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminUsersService();
    }

    public function index() {
        echo json_encode($this->service->getAllUsers());
    }

    public function store() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->createUser($body);
        $this->respond($result, 201);
    }

    public function updateRole(string $id) {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        echo json_encode($this->service->updateUserRole($id, $body));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteUser($id));
    }
}
