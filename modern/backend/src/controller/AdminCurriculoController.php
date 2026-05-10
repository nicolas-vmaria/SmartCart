<?php

require_once __DIR__ . '/../service/AdminCurriculoService.php';

class AdminCurriculoController {
    private AdminCurriculoService $service;

    public function __construct() {
        $this->service = new AdminCurriculoService();
    }

    public function index() {
        echo json_encode($this->service->getAllCurriculos());
    }

    public function updateStatus($id) {
        echo json_encode($this->service->updateStatus($id));
    }

    public function destroy($id) {
        echo json_encode($this->service->deleteCurriculo($id));
    }
}
