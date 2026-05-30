<?php

require_once __DIR__ . '/../service/CouponService.php';
require_once __DIR__ . '/BaseController.php';

class CouponController extends BaseController {
    private CouponService $service;

    public function __construct() {
        $this->service = new CouponService();
    }

    public function validate() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->validateCoupon($body);
        $this->respond($result);
    }
}
