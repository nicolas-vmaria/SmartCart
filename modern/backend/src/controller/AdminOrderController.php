<?php

require_once __DIR__ . '/../service/AdminOrderService.php';

class AdminOrderController {
    private AdminOrderService $service;

    public function __construct() {
        $this->service = new AdminOrderService();
    }

    public function index() {
        echo json_encode($this->service->getAllOrders());
    }

    public function updateStatus($id) {
        echo json_encode($this->service->updateStatus($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteOrder($id));
    }

    public function analytics() {
        echo json_encode($this->service->getMonthlyAnalytics());
    }
}
