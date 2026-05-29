<?php

require_once __DIR__ . '/../service/AdminOrderService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/BaseController.php';

class AdminOrderController extends BaseController {
    private AdminOrderService $service;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->service = new AdminOrderService();
    }

    public function index() {
        $result = $this->service->getAllOrders();
        $this->respond($result);
    }

    public function getOrderById(string $id) {
        $result = $this->service->getOrderById((int) $id);
        $this->respond($result);
    }

    public function updateStatus(string $id) {
        $body = $this->getBody();

        if (!$body) {
            $this->respond(['error' => 'JSON inválido ou corpo vazio'], 400);
            return;
        }

        $result = $this->service->updateStatus($id, $body);
        $this->respond($result);
        
    }

    public function analytics() {
        $mes = isset($_GET['mes']) ? (int) $_GET['mes'] : (int) date('n');
        $ano = isset($_GET['ano']) ? (int) $_GET['ano'] : (int) date('Y');

        if ($mes < 1 || $mes > 12) {
            $this->respond(['error' => 'Mês inválido'], 400);
            return;
        }
        if ($ano < 2000 || $ano > (int) date('Y')) {
            $this->respond(['error' => 'Ano inválido'], 400);
            return;
        }

        $result = $this->service->getMonthlyAnalytics($mes, $ano);
        $this->respond($result);
    }
}
