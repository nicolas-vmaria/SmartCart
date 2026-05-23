<?php

require_once __DIR__ . '/../service/CartService.php';
require_once __DIR__ . '/../repository/CartRepository.php';
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../core/Jwt.php';

class CartController extends BaseController {
    private CartService $service;

    public function __construct() {
        $this->service = new CartService();
    }

    public function index() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);

        $payload = Jwt::verify($token);
        $usuario_id = $payload['userId'];

        $result = $this->service->getCart($usuario_id);
        $this->respond($result);
    }

    public function addItem() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);

        $payload = Jwt::verify($token);
        $body['usuario_id'] = $payload['userId'];

        $result = $this->service->addItem($body);
        $this->respond($result);
    }

    public function updateItem(int $item_id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateItem($item_id, $body);
        $this->respond($result);
    }

    public function removeItem($id) {
        $result = $this->service->removeItem($id);
        $this->respond($result);
    }

    public function clear() {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        $token = str_replace('Bearer ', '', $authHeader);

        $payload = Jwt::verify($token);
        $usuario_id = $payload['userId'];

        $result = $this->service->clearCart($usuario_id);
        $this->respond($result);
    }   
}
