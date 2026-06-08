<?php

require_once __DIR__ . '/../service/AdminReviewService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminReviewController extends BaseController {
    private AdminReviewService $service;
    private array $admin;

    public function __construct() {
        $this->admin   = AuthMiddleware::handle('admin');
        $this->service = new AdminReviewService();
    }

    public function index() {
        $search = $_GET['search'] ?? null;
        $nota   = isset($_GET['nota']) ? (int) $_GET['nota'] : null;
        $this->respond($this->service->getAll($search, $nota));
    }

    public function destroy($id) {
        $this->respond($this->service->delete((int) $id, $this->admin));
    }

    public function bulkDestroy() {
        $body = $this->getBody();
        $raw  = $body['ids'] ?? [];
        $ids  = is_array($raw) ? array_map('intval', $raw) : [];
        $this->respond($this->service->bulkDelete($ids, $this->admin));
    }

    public function getPalavras() {
        $this->respond($this->service->getPalavras());
    }

    public function addPalavra() {
        $body   = $this->getBody();
        $palavra = $body['palavra'] ?? '';
        $this->respond($this->service->addPalavra($palavra, $this->admin));
    }

    public function deletePalavra($id) {
        $this->respond($this->service->deletePalavra((int) $id, $this->admin));
    }
}
