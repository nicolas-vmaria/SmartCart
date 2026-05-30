<?php

require_once __DIR__ . '/../controller/BannerController.php';

$router->get('/banners', [BannerController::class, 'index']);
