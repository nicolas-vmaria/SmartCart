<?php

require_once __DIR__ . '/../service/AdminOrderService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminOrderController {
    private AdminOrderService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_pedidos');
        $this->service = new AdminOrderService();
    }

    public function index() {
        echo json_encode($this->service->getAllOrders());
    }

    public function updateStatus(string $id) {
        echo json_encode($this->service->updateStatus($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteOrder($id));
    }

    public function analytics() {
        echo json_encode($this->service->getMonthlyAnalytics());
    }
}
