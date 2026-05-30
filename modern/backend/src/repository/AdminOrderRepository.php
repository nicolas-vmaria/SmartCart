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

    public function getOrderById(int $id): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    p.id,
                    p.usuario_id,
                    p.metodo_pagamento,
                    p.transacao_id,
                    p.total,
                    p.status,
                    p.created_at,
                    p.cep,
                    p.rua,
                    p.numero,
                    p.complemento,
                    p.bairro,
                    p.cidade,
                    p.estado,
                    p.codigo_rastreio,
                    u.nome,
                    u.email,
                    c.codigo AS cupom_codigo,
                    c.desconto AS cupom_desconto,
                    c.tipo_desconto
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

    public function getOrderItems(int $pedido_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    ip.id,
                    ip.produto_id,
                    ip.quantidade,
                    ip.preco_unitario_historico,
                    ip.subtotal,
                    pr.nome,
                    pr.slug,
                    pr.foto_url
                FROM Itens_Pedido ip
                JOIN Produtos pr ON pr.id = ip.produto_id
                WHERE ip.pedido_id = :pedido_id
            ");
            $stmt->execute([':pedido_id' => $pedido_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ORDER_ITEMS', 0, $e);
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

    public function getMonthlyAnalytics(int $mes, int $ano): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    DAY(created_at)  AS dia,
                    COUNT(*)         AS pedidos,
                    SUM(total)       AS valor
                FROM Pedidos
                WHERE YEAR(created_at)  = :ano
                  AND MONTH(created_at) = :mes
                GROUP BY DAY(created_at)
                ORDER BY dia
            ");
            $stmt->execute([':ano' => $ano, ':mes' => $mes]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_MONTHLY_ANALYTICS', 0, $e);
        }
    }
}
