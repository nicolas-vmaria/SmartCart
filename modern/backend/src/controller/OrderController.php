<?php

require_once __DIR__ . '/../service/OrderService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class OrderController extends BaseController {
    private OrderService $service;

    public function __construct() {
        $this->service = new OrderService();
    }

    public function index() {
        $payload = AuthMiddleware::handle();
        $result = $this->service->getUserOrders((int) $payload['userId']);
        $this->respond($result);
    }

    public function show($id) {
        $payload = AuthMiddleware::handle();
        $result = $this->service->getOrderById((int) $id, (int) $payload['userId']);
        $this->respond($result);
    }

    public function store() {
        $payload = AuthMiddleware::handle();
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createOrder((int) $payload['userId'], $body);
        $this->respond($result, 201);
    }

    public function destroy($id) {
        $payload = AuthMiddleware::handle();
        $result = $this->service->cancelOrder((int) $id, (int) $payload['userId']);
        $this->respond($result);
    }

    public function tracking($id) {
        $payload = AuthMiddleware::handle();
        $result = $this->service->getTracking((int) $id, (int) $payload['userId']);
        $this->respond($result);
    }

    public function reviewItems($id) {
        $payload = AuthMiddleware::handle();
        $result  = $this->service->getOrderReviewItems((int) $id, (int) $payload['userId']);
        $this->respond($result);
    }
}