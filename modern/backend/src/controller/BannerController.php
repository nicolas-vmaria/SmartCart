<?php

require_once __DIR__ . '/../repository/AdminBannerRepository.php';
require_once __DIR__ . '/BaseController.php';

class BannerController extends BaseController {
    private AdminBannerRepository $repository;

    public function __construct() {
        $this->repository = new AdminBannerRepository();
    }

    public function index() {
        try {
            $banners = $this->repository->findActive();
            $this->respond(['banners' => $banners]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao buscar banners']);
        }
    }
}
