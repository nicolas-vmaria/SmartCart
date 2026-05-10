<?php

require_once __DIR__ . '/../service/CartService.php';

class CartController {
    private CartService $service;

    public function __construct() {
        $this->service = new CartService();
    }

    public function index() {
        echo json_encode($this->service->getCart());
    }

    public function addItem() {
        echo json_encode($this->service->addItem());
    }

    public function updateItem($id) {
        echo json_encode($this->service->updateItem($id));
    }

    public function removeItem($id) {
        echo json_encode($this->service->removeItem($id));
    }

    public function clear() {
        echo json_encode($this->service->clearCart());
    }
}
