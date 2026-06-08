<?php

require_once __DIR__ . '/../service/AdminProfileService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminProfileController extends BaseController {
    private AdminProfileService $service;
    private array $admin;
    private int $userId;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin');
        $this->userId  = (int)$this->admin['userId'];
        $this->service = new AdminProfileService();
    }

    public function show(): void {
        $this->respond($this->service->getProfile($this->userId));
    }

    public function update(): void {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->updateProfile($this->userId, $body, $this->admin));
    }

    public function changePassword(): void {
        $body = $this->getBody();
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
        $this->respond($this->service->changePassword($this->userId, $body, $this->admin));
    }
}
