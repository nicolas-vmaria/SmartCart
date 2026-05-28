<?php

require_once __DIR__ . '/../repository/AdminVacanciesRepository.php';
require_once __DIR__ . '/BaseController.php';

class VagasController extends BaseController {
    private AdminVacanciesRepository $repository;

    public function __construct() {
        $this->repository = new AdminVacanciesRepository();
    }

    public function index() {
        try {
            $this->respond(['vagas' => $this->repository->findAllActive()]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao buscar vagas']);
        }
    }
}
