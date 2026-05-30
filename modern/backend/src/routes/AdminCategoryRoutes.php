<?php

require_once __DIR__ . '/../controller/AdminCategoryController.php';

$router->get('/admin/category',          [AdminCategoryController::class, 'index']);
$router->post('/admin/category',         [AdminCategoryController::class, 'store']);
$router->put('/admin/category/{id}',     [AdminCategoryController::class, 'update']);
$router->delete('/admin/category/{id}',  [AdminCategoryController::class, 'destroy']);
