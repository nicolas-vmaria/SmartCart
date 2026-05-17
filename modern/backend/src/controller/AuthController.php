<?php

require_once __DIR__ . '/../service/AuthService.php';
require_once __DIR__ . '/BaseController.php';

class AuthController extends BaseController {
    private AuthService $service;

    public function __construct() {
        $this->service = new AuthService();
    }

    public function login() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->login($body);
        $this->respond($result);
        }

    public function register() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->register($body);
        $this->respond($result);
    }

    public function forgotPassword() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->forgotPassword($body);
        $this->respond($result);

        
    }

    public function resetPassword() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->resetPassword($body);
        $this->respond($result);
    }

    public function googleLogin() {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $result = $this->service->googleLogin($body);
        $this->respond($result);
    }
}
