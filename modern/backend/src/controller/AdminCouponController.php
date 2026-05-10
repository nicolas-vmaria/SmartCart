<?php

require_once __DIR__ . '/../service/AdminCouponService.php';

class AdminCouponController {
    private AdminCouponService $service;

    public function __construct() {
        $this->service = new AdminCouponService();
    }

    public function index() {
        echo json_encode($this->service->getAllCoupons());
    }

    public function store() {
        echo json_encode($this->service->createCoupon());
    }

    public function update($id) {
        echo json_encode($this->service->updateCoupon($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteCoupon($id));
    }
}
