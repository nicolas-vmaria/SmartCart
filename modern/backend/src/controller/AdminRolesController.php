<?php

require_once __DIR__ . '/../service/AdminRolesService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminRolesController extends BaseController {
    private AdminRolesService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_admin');
        $this->service = new AdminRolesService();
    }

    public function index() {
        $result = $this->service->getAllRoles();
        $this->respond($result);
    }

    public function store() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->createRole($body);
        $this->respond($result);
    }

    public function update(string $id) {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->updateRole($id, $body);
        $this->respond($result);
    }

    public function destroy(string $id) {
        $result = $this->service->deleteRole($id);
        $this->respond($result);
    }
}
