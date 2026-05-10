<?php

class OrderService {
    public function getUserOrders() {
        return ['message' => 'Listando pedidos do usuário'];
    }

    public function getOrderById($id) {
        return ['message' => "Retornando pedido $id"];
    }

    public function createOrder() {
        return ['message' => 'Pedido criado com sucesso'];
    }

    public function updateStatus($id) {
        return ['message' => "Status do pedido $id atualizado"];
    }

    public function cancelOrder($id) {
        return ['message' => "Pedido $id cancelado"];
    }

    public function getTracking($id) {
        return ['message' => "Rastreamento do pedido $id"];
    }
}
