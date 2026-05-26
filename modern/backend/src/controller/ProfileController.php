<?php

require_once __DIR__ . '/../service/ProfileService.php';
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ProfileController extends BaseController {
    private ProfileService $service;

    public function __construct() {
        $this->service = new ProfileService();
    }

    public function index() {
        $payload = AuthMiddleware::handle();
        $result = $this->service->getProfile((int) $payload['userId']);
        $this->respond($result);
    }

    public function update() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateProfile((int) $payload['userId'], $body);
        $this->respond($result);
    }

    public function updateAddress() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateAddress((int) $payload['userId'], $body);
        $this->respond($result);
    }

    public function updatePassword() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updatePassword((int) $payload['userId'], $body);
        $this->respond($result);
    }

    public function updateAvatar() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateAvatar((int) $payload['userId'], $body);
        $this->respond($result);
    }
}