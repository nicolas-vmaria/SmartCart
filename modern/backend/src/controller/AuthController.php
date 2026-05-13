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
        $raw = file_get_contents('php://input');
        $body = json_decode($raw, true);
        if (!is_array($body)) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->register($body);
        if (is_array($result) && isset($result['user']) && !isset($result['error'])) {
            http_response_code(201);
        }
        echo json_encode($result);
    }

    public function forgotPassword() {
        echo json_encode($this->service->forgotPassword());
    }

    public function resetPassword() {
        echo json_encode($this->service->resetPassword());
    }
}
