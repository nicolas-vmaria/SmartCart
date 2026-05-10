<?php

require_once __DIR__ . '/../service/AdminClientService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminClientController {
    private AdminClientService $service;

    public function __construct() {
        AuthMiddleware::handle();
        $this->service = new AdminClientService();
    }

    public function index() {
        echo json_encode($this->service->getAllClients());
    }

    public function store() {
        echo json_encode($this->service->createClient());
    }

    public function update(string $id) {
        echo json_encode($this->service->updateClient($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteClient($id));
    }
}
