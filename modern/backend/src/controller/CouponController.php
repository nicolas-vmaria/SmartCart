<?php

require_once __DIR__ . '/../service/CouponService.php';

class CouponController {
    private CouponService $service;

    public function __construct() {
        $this->service = new CouponService();
    }

    public function validate() {
        echo json_encode($this->service->validateCoupon());
    }
}
