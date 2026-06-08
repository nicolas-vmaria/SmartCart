<?php

require_once __DIR__ . '/../service/AdminVacanciesService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminVacanciesController extends BaseController {
    private AdminVacanciesService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin', 'ver_trabalhos');
        $this->service = new AdminVacanciesService();
    }

    public function index() {
        $this->respond($this->service->getAllVacancies());
    }

    public function show(string $id) {
    $this->respond($this->service->getVacancyById($id));
    }

    public function store() {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->createVacancy($body, $this->admin);
        $this->respond($result, 201);
    }

    public function update(string $id) {
        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $result = $this->service->updateVacancy($id, $body, $this->admin);
        $this->respond($result);
    }

    public function toggle(string $id) {
        $this->respond($this->service->toggleVacancy($id, $this->admin));
    }

    public function destroy(string $id) {
        $this->respond($this->service->deleteVacancy($id, $this->admin));
    }
}

