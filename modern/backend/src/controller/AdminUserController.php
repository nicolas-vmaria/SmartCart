<?php

require_once __DIR__ . '/../service/AdminUserService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminUserController {
    private AdminUserService $service;

    public function __construct() {
        AuthMiddleware::handle();
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
        echo json_encode($this->service->getAllRoles());
    }

    public function storeRole() {
        echo json_encode($this->service->createRole());
    }

    public function destroyRole(string $id) {
        echo json_encode($this->service->deleteRole($id));
    }
}
