<?php

require_once __DIR__ . '/../service/AdminAuthService.php';

class AdminAuthController {
    private AdminAuthService $service;

    public function __construct() {
        $this->service = new AdminAuthService();
    }

    public function login() {
        $body = json_decode(file_get_contents('php://input'), true);
        echo json_encode($this->service->login($body));
    }
}
