<?php

require_once __DIR__ . '/../service/AdminCurriculoService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminCurriculoController extends BaseController {
    private AdminCurriculoService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_curriculos');
        $this->service = new AdminCurriculoService();
    }

    public function index() {
        $search = $_GET['search'] ?? null;
        $status = $_GET['status'] ?? null;

        $result = $this->service->getAllCurriculos(
            $search ?: null,
            $status ?: null
        );

        if (isset($result['error'])) {
            http_response_code(500);
            echo json_encode(['error' => $result['error']]);
            return;
        }

        $this->respond($result);
    }

    public function show(string $id) {
        $result = $this->service->getCurriculo($id);
        $this->respond($result);
    }

    public function updateStatus(string $id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateStatus($id, $body, $this->admin);
        $this->respond($result);
    }

    public function destroy(string $id) {
        $result = $this->service->deleteCurriculo($id, $this->admin);
        $this->respond($result);
    }
}