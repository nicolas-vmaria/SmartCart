<?php

require_once __DIR__ . '/../controller/AdminVacanciesController.php';

$router->get('/admin/vagas',                [AdminVacanciesController::class, 'index']);
$router->get('/admin/vagas/{id}',           [AdminVacanciesController::class, 'show']);
$router->post('/admin/vagas',               [AdminVacanciesController::class, 'store']);
$router->put('/admin/vagas/{id}',           [AdminVacanciesController::class, 'update']);
$router->patch('/admin/vagas/{id}/toggle',  [AdminVacanciesController::class, 'toggle']);
$router->delete('/admin/vagas/{id}',        [AdminVacanciesController::class, 'destroy']);

