<?php

require_once __DIR__ . '/../controller/ContactController.php';

$router->post('/contact',       [ContactController::class, 'send']);
$router->post('/career/apply',  [ContactController::class, 'apply']);
