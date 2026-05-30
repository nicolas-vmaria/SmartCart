<?php

require_once __DIR__ . '/../service/CartService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class CartController extends BaseController {
    private CartService $service;

    public function __construct() {
        $this->service = new CartService();
    }

    public function index() {
        $payload = AuthMiddleware::handle();
        $result = $this->service->getCart((int) $payload['userId']);
        $this->respond($result);
    }

    public function addItem() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $body['usuario_id'] = (int) $payload['userId'];
        $result = $this->service->addItem($body);
        $this->respond($result);
    }

    public function updateItem(int $item_id) {
        AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateItem($item_id, $body);
        $this->respond($result);
    }

    public function removeItem(int $id) {
        AuthMiddleware::handle();
        $result = $this->service->removeItem($id);
        $this->respond($result);
    }

    public function clear() {
        $payload = AuthMiddleware::handle();
        $result = $this->service->clearCart((int) $payload['userId']);
        $this->respond($result);
    }
}