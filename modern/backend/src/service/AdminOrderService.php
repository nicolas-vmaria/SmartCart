<?php

class AdminOrderService {
    public function getAllOrders() {
        return ['message' => 'Listando todos os pedidos (admin)'];
    }

    public function updateStatus($id) {
        return ['message' => "Status do pedido $id atualizado"];
    }

    public function deleteOrder($id) {
        return ['message' => "Pedido $id removido"];
    }

    public function getMonthlyAnalytics() {
        return ['message' => 'Retornando analytics mensais'];
    }
}
