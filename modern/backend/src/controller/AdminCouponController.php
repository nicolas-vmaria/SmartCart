<?php

require_once __DIR__ . '/../service/AdminCouponService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminCouponController extends BaseController {
    private AdminCouponService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminCouponService();
    }

    public function index() {
        $respond = $this->service->getAllCoupons();
        
        if (isset($respond['error'])) {
            http_response_code(500);
            echo json_encode(['error' => $respond['error']]);
            return;
        }
        
        $this->respond($respond);
    }

    public function store() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createCoupon($body);
        $this->respond($result, 201);
    }

    public function update(string $id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateCoupon($id, $body);
        $this->respond($result);
    }

    public function destroy(string $id) {
        $result = $this->service->deleteCoupon($id);
        $this->respond($result);
    }
}
