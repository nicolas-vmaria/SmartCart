<?php

require_once __DIR__ . '/../controller/CouponController.php';

$router->post('/coupon/validate', [CouponController::class, 'validate']);
