<?php

require_once __DIR__ . '/../service/AdminUserService.php';

class AdminUserController {
    private AdminUserService $service;

    public function __construct() {
        $this->service = new AdminUserService();
    }

    public function index() {
        echo json_encode($this->service->getAllUsers());
    }

    public function updateRole($id) {
        echo json_encode($this->service->updateUserRole($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteUser($id));
    }

    public function roles() {
        echo json_encode($this->service->getAllRoles());
    }

    public function storeRole() {
        echo json_encode($this->service->createRole());
    }

    public function destroyRole($id) {
        echo json_encode($this->service->deleteRole($id));
    }
}
