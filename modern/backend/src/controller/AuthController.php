<?php

require_once __DIR__ . '/../service/AuthService.php';

class AuthController {
    private AuthService $service;

    public function __construct() {
        $this->service = new AuthService();
    }

    public function login() {
        echo json_encode($this->service->login());
    }

    public function register() {
        echo json_encode($this->service->register());
    }

    public function forgotPassword() {
        echo json_encode($this->service->forgotPassword());
    }

    public function resetPassword() {
        echo json_encode($this->service->resetPassword());
    }
}
