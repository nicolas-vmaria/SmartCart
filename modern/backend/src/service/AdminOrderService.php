<?php

require_once __DIR__ . '/../repository/AdminOrderRepository.php';

class AdminOrderService {
    private AdminOrderRepository $repository;

    public function __construct() {
        $this->repository = new AdminOrderRepository();
    }

    public function getAllOrders() {
        try {
            return ['orders' => $this->repository->getAllOrders()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedidos'];
        }
    }

    public function getOrderById($id) {
        try {
            return ['order' => $this->repository->getOrderById($id)];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedido'];
        }
    }

    public function updateStatus(int $id, array $body): array {
        $statusValidos = ['aguardando', 'pago', 'enviado', 'entregue', 'cancelado'];

        if (empty($body['status']) || !in_array($body['status'], $statusValidos)) {
            http_response_code(400);
            return ['error' => 'Status inválido'];
        }

        try {
            $updated = $this->repository->updateStatus($id, $body['status'], $body['codigo_rastreio'] ?? null);
            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            return ['message' => 'Status atualizado com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao atualizar status'];
        }
    }

    public function getMonthlyAnalytics() {
        return ['message' => 'Retornando analytics mensais'];
    }
}
