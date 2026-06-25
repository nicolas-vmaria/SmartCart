<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../service/AdminReportService.php';
require_once __DIR__ . '/BaseController.php';

class AdminReportController extends BaseController {
    private AdminReportService $service;
    private array $admin;

    public function __construct() {
        $this->admin = AuthMiddleware::handle('admin');
        $this->service = new AdminReportService();
    }

    public function store(): void {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON invalido ou corpo vazio']);
            return;
        }

        $result = $this->service->send($body, $this->admin);
        if (!isset($result['error'])) {
            http_response_code(201);
        }
        echo json_encode($result);
    }
}
