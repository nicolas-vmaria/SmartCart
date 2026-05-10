<?php

require_once __DIR__ . '/../service/AdminClientService.php';

class AdminClientController {
    private AdminClientService $service;

    public function __construct() {
        $this->service = new AdminClientService();
    }

    public function index() {
        echo json_encode($this->service->getAllClients());
    }

    public function store() {
        echo json_encode($this->service->createClient());
    }

    public function update($id) {
        echo json_encode($this->service->updateClient($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteClient($id));
    }
}
