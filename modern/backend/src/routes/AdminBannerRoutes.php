<?php

require_once __DIR__ . '/../controller/AdminBannerController.php';

$router->get('/admin/banner',                   [AdminBannerController::class, 'index']);
$router->post('/admin/banner',                  [AdminBannerController::class, 'store']);
$router->delete('/admin/banner/{id}',           [AdminBannerController::class, 'destroy']);
$router->put('/admin/banner/reorder',           [AdminBannerController::class, 'reorder']);
$router->patch('/admin/banner/{id}/toggle',     [AdminBannerController::class, 'toggle']);
