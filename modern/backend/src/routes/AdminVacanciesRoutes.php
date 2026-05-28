<?php

require_once __DIR__ . '/../controller/AdminVacanciesController.php';

$router->get('/admin/vacancies', [AdminVacanciesController::class, 'index']);
$router->get('/admin/vacancies/{id}', [AdminVacanciesController::class, 'show']);
$router->post('/admin/vacancies', [AdminVacanciesController::class, 'store']);
$router->put('/admin/vacancies/{id}', [AdminVacanciesController::class, 'update']);
$router->delete('/admin/vacancies/{id}', [AdminVacanciesController::class, 'destroy']);

