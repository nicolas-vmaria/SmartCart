<?php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../service/AdminAuthService.php';

class AdminAuthController extends BaseController {
    private AdminAuthService $service;

    public function __construct() {
        $this->service = new AdminAuthService();
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
}
