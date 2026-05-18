<?php

require_once __DIR__ . '/../service/AdminClientService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminClientController extends BaseController {
    private AdminClientService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminClientService();
    }

    public function index() {
        $result = $this->service->getAllClients();
        $this->respond($result);
    }

    public function destroy($id) {
        $result = $this->service->deleteClient($id);
        $this->respond($result);
    }
}
