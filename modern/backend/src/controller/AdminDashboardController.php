<?php

require_once __DIR__ . '/../service/AdminDashboardService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminDashboardController extends BaseController {
    private AdminDashboardService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminDashboardService();
    }

    public function index() {
        $this->respond($this->service->getDashboard());
    }
}
