<?php

require_once __DIR__ . '/../service/AdminOrderService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminOrderController extends BaseController {
    private AdminOrderService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_pedidos');
        $this->service = new AdminOrderService();
    }

    public function index() {
        $result = $this->service->getAllOrders();
        $this->respond($result);
    }

    public function getOrderById(string $id) {
        $result = $this->service->getOrderById($id);
        $this->respond($result);
    }

    public function updateStatus(string $id) {
        $body = $this->getBody();

        if (!$body) {
            $this->respond(['error' => 'JSON inválido ou corpo vazio'], 400);
            return;
        }

        $result = $this->service->updateStatus($id, $body);
        $this->respond($result);
        
    }

    public function analytics() {
        echo json_encode($this->service->getMonthlyAnalytics());
    }
}
