<?php

require_once __DIR__ . '/../service/CartService.php';
require_once __DIR__ . '/../repository/CartRepository.php';
require_once __DIR__ . '/BaseController.php';

class CartController extends BaseController {
    private CartService $service;

    public function __construct() {
        $this->service = new CartService();
    }

    public function index() {
        echo json_encode($this->service->getCart());
    }

    public function addItem() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->addItem($body);
        $this->respond($result);
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
