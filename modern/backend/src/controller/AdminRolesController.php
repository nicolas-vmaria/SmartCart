<?php

require_once __DIR__ . '/../service/AdminRolesService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminUserController extends BaseController {
    private AdminUserService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminUserService();
    }

    public function index() {
        echo json_encode($this->service->getAllUsers());
    }

    public function updateRole(string $id) {
        echo json_encode($this->service->updateUserRole($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteUser($id));
    }

    public function roles() {
        $result = $this->service->getAllRoles();
        $this->respond($result);
    }

    public function storeRole() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createRole($body);
        $this->respond($result, 201);
    }

    public function destroyRole(string $id) {
        echo json_encode($this->service->deleteRole($id));
    }
}
