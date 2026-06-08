<?php

require_once __DIR__ . '/../service/AdminEmployeesService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminEmployeesController extends BaseController {
    private AdminEmployeesService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_admin');
        $this->service = new AdminEmployeesService();
    }

    protected function respond(array $result, int $successCode = 200): void {
        if (isset($result['error'])) {
            http_response_code($result['status'] ?? 400);
            echo json_encode(['error' => $result['error']]);
            return;
        }
        http_response_code($successCode);
        echo json_encode($result);
    }

    public function index(): void {
        $this->respond($this->service->getAllEmployee());
    }

    public function store(): void {
        $body = $this->getBody();
        if (!$body) {
            $this->respond(['error' => 'JSON inválido ou corpo vazio'], 400);
            return;
        }
        $result = $this->service->createEmployee($body, $this->admin);
        $this->respond($result, 201);
    }

    public function update(string $id): void {
        $body = $this->getBody();
        if (!$body) {
            $this->respond(['error' => 'JSON inválido ou corpo vazio'], 400);
            return;
        }
        $this->respond($this->service->updateEmployee($id, $body, $this->admin));
    }

    public function destroy(string $id): void {
        $this->respond($this->service->deleteEmployee($id, $this->admin));
    }

    public function resetPassword(string $id): void {
    $this->respond($this->service->resetPassword($id, $this->admin));
    }
}