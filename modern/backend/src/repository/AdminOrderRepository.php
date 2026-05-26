<?php 

require_once __DIR__ . '/../core/connection.php';

class AdminOrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getAllOrders(): array {
    try {
        $stmt = $this->db->prepare('
            SELECT 
                p.id,
                p.status,
                p.total,
                p.metodo_pagamento,
                p.created_at,
                u.nome AS cliente,
                p.cep,
                p.codigo_rastreio,
                p.numero,
                p.complemento,
                COUNT(ip.id) AS qtd_itens
            FROM Pedidos p
            JOIN Usuario u ON u.id = p.usuario_id
            LEFT JOIN Itens_Pedido ip ON ip.pedido_id = p.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        ');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        throw new RuntimeException('ERRO_GET_ALL_PEDIDOS', 0, $e);
    }
}

    public function getOrderById(int $id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT p.id, 
                    p.usuario_id,
                    p.metodo_pagamento,
                    p.transacao_id,
                    p.total,
                    p.created_at,
                    u.nome,
                    p.cep,
                    p.numero,
                    p.complemento,
                    p.codigo_rastreio,
                    p.status,
                    c.codigo AS cupom_codigo,
                    c.desconto AS cupom_desconto
                FROM Pedidos p
                JOIN Usuario u ON u.id = p.usuario_id
                LEFT JOIN Cupons c ON c.id = p.id_cupom
                WHERE p.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ORDER_BY_ID', 0, $e);
        }
    }

    public function updateStatus(int $id, string $status, ?string $codigo_rastreio): bool {
        try {
            $stmt = $this->db->prepare("
                UPDATE Pedidos
                SET status = :status,
                    codigo_rastreio = COALESCE(:codigo_rastreio, codigo_rastreio)
                WHERE id = :id
            ");
            $stmt->execute([
                ':status'          => $status,
                ':codigo_rastreio' => $codigo_rastreio,
                ':id'              => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_ORDER_STATUS', 0, $e);
        }
    }
}