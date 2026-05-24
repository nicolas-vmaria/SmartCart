<?php

require_once __DIR__ . '/../service/AdminCurriculoService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AdminCurriculoController {
    private AdminCurriculoService $service;

    public function __construct() {
        AuthMiddleware::handle('admin', 'ver_curriculos');
        $this->service = new AdminCurriculoService();
    }

    public function index() {
        echo json_encode($this->service->getAllCurriculos());
    }

    public function updateStatus(string $id) {
        echo json_encode($this->service->updateStatus($id));
    }

    public function destroy(string $id) {
        echo json_encode($this->service->deleteCurriculo($id));
    }
}
