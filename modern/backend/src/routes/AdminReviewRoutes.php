<?php

require_once __DIR__ . '/../controller/AdminReviewController.php';

// Rotas estáticas ANTES das dinâmicas para evitar conflito com {id}
$router->get('/admin/review/palavras-proibidas',        [AdminReviewController::class, 'getPalavras']);
$router->post('/admin/review/palavras-proibidas',       [AdminReviewController::class, 'addPalavra']);
$router->delete('/admin/review/palavras-proibidas/{id}',[AdminReviewController::class, 'deletePalavra']);
$router->post('/admin/review/bulk-delete',              [AdminReviewController::class, 'bulkDestroy']);

$router->get('/admin/review',                           [AdminReviewController::class, 'index']);
$router->delete('/admin/review/{id}',                   [AdminReviewController::class, 'destroy']);
