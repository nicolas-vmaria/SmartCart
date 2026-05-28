<?php

require_once __DIR__ . '/../service/CandidacyService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class CandidacyController extends BaseController {
    private CandidacyService $service;

    public function __construct() {
        $this->service = new CandidacyService();
    }

    public function index() {
        $this->respond($this->service->getAllTrabalhos());
    }

    public function show(string $slug) {
        $this->respond($this->service->getTrabalhoBySlug($slug));
    }

    public function candidatar(string $id) {
        AuthMiddleware::handle();

        $body = $this->getBody();

        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }

        $this->respond($this->service->candidatar($id, $body));
    }

    public function espontanea() {
        AuthMiddleware::handle();
 
        $body = $this->getBody();
 
        if (!$body) {
            http_response_code(400);
            echo json_encode(['error' => 'JSON inválido ou corpo vazio']);
            return;
        }
 
        $this->respond($this->service->candidaturaEspontanea($body));
    }
}