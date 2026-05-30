<?php

require_once __DIR__ . '/../controller/AdminCouponController.php';

$router->get('/admin/coupon',          [AdminCouponController::class, 'index']);
$router->post('/admin/coupon',         [AdminCouponController::class, 'store']);
$router->put('/admin/coupon/{id}',     [AdminCouponController::class, 'update']);
$router->delete('/admin/coupon/{id}',  [AdminCouponController::class, 'destroy']);
