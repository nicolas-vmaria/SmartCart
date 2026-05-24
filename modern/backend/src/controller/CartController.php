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

    private function getUserIdFromToken(): int {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!str_starts_with($auth, 'Bearer ')) {
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $payload = Jwt::verify(substr($auth, 7));
        return (int) $payload['userId'];
    }

    public function index() {
        $usuario_id = $this->getUserIdFromToken();
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

        $body['usuario_id'] = $this->getUserIdFromToken();
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

    public function removeItem(int $id) {
        $result = $this->service->removeItem($id);
        $this->respond($result);
    }

    public function clear() {
        $usuario_id = $this->getUserIdFromToken();
        $result = $this->service->clearCart($usuario_id);
        $this->respond($result);
    }   
}
