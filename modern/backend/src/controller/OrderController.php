<?php

require_once __DIR__ . '/../service/OrderService.php';

class OrderController {
    private OrderService $service;

    public function __construct() {
        $this->service = new OrderService();
    }

    public function index() {
        echo json_encode($this->service->getUserOrders());
    }

    public function show($id) {
        echo json_encode($this->service->getOrderById($id));
    }

    public function store() {
        echo json_encode($this->service->createOrder());
    }

    public function updateStatus($id) {
        echo json_encode($this->service->updateStatus($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->cancelOrder($id));
    }

    public function tracking($id) {
        echo json_encode($this->service->getTracking($id));
    }
}
