<?php

require_once __DIR__ . '/../controller/CandidacyController.php';

$router->get('/trabalhos', [CandidacyController::class, 'index']);
$router->get('/trabalhos/{slug}', [CandidacyController::class, 'show']);
$router->post('/trabalhos/{id}/candidatar', [CandidacyController::class, 'candidatar']);
$router->post('/trabalhos/espontanea', [CandidacyController::class, 'espontanea']);