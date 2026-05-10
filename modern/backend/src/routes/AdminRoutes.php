<?php

require_once __DIR__ . '/../controller/AdminProductController.php';
require_once __DIR__ . '/../controller/AdminOrderController.php';
require_once __DIR__ . '/../controller/AdminClientController.php';
require_once __DIR__ . '/../controller/AdminCategoryController.php';
require_once __DIR__ . '/../controller/AdminUserController.php';
require_once __DIR__ . '/../controller/AdminCurriculoController.php';
require_once __DIR__ . '/../controller/AdminCouponController.php';

// Produtos
$router->get('/admin/product',          [AdminProductController::class, 'index']);
$router->post('/admin/product',         [AdminProductController::class, 'store']);
$router->put('/admin/product/{id}',     [AdminProductController::class, 'update']);
$router->delete('/admin/product/{id}',  [AdminProductController::class, 'destroy']);

// Pedidos
$router->get('/admin/order',                    [AdminOrderController::class, 'index']);
$router->put('/admin/order/{id}/status',        [AdminOrderController::class, 'updateStatus']);
$router->delete('/admin/order/{id}',            [AdminOrderController::class, 'destroy']);
$router->get('/admin/order/analytics/monthly',  [AdminOrderController::class, 'analytics']);

// Clientes
$router->get('/admin/client',           [AdminClientController::class, 'index']);
$router->post('/admin/client',          [AdminClientController::class, 'store']);
$router->put('/admin/client/{id}',      [AdminClientController::class, 'update']);
$router->delete('/admin/client/{id}',   [AdminClientController::class, 'destroy']);

// Categorias
$router->get('/admin/category',         [AdminCategoryController::class, 'index']);
$router->post('/admin/category',        [AdminCategoryController::class, 'store']);
$router->put('/admin/category/{id}',    [AdminCategoryController::class, 'update']);
$router->delete('/admin/category/{id}', [AdminCategoryController::class, 'destroy']);

// Usuários e Roles
$router->get('/admin/user',             [AdminUserController::class, 'index']);
$router->put('/admin/user/{id}/role',   [AdminUserController::class, 'updateRole']);
$router->delete('/admin/user/{id}',     [AdminUserController::class, 'destroy']);
$router->get('/admin/role',             [AdminUserController::class, 'roles']);
$router->post('/admin/role',            [AdminUserController::class, 'storeRole']);
$router->put('/admin/role/{id}',        [AdminUserController::class, 'updateRole']);
$router->delete('/admin/role/{id}',     [AdminUserController::class, 'destroyRole']);

// Currículos
$router->get('/admin/curriculo',            [AdminCurriculoController::class, 'index']);
$router->put('/admin/curriculo/{id}',       [AdminCurriculoController::class, 'updateStatus']);
$router->delete('/admin/curriculo/{id}',    [AdminCurriculoController::class, 'destroy']);

// Cupons
$router->get('/admin/coupon',           [AdminCouponController::class, 'index']);
$router->post('/admin/coupon',          [AdminCouponController::class, 'store']);
$router->put('/admin/coupon/{id}',      [AdminCouponController::class, 'update']);
$router->delete('/admin/coupon/{id}',   [AdminCouponController::class, 'destroy']);
