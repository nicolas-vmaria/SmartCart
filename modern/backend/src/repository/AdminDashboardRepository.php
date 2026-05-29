<?php

require_once __DIR__ . '/../core/connection.php';

class AdminDashboardRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getSummary(): array {
        $stmt = $this->db->query("
            SELECT
                COALESCE(SUM(CASE WHEN status IN ('pago','enviado','entregue') THEN total ELSE 0 END), 0) AS faturamento_total,
                COUNT(CASE WHEN status = 'aguardando' THEN 1 END)                                         AS pedidos_novos
            FROM Pedidos
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAnnualData(int $ano): array {
        $stmt = $this->db->prepare("
            SELECT
                MONTH(created_at)  AS mes,
                COUNT(*)           AS pedidos,
                COALESCE(SUM(total), 0) AS valor
            FROM Pedidos
            WHERE YEAR(created_at) = :ano
            GROUP BY MONTH(created_at)
            ORDER BY mes
        ");
        $stmt->execute([':ano' => $ano]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getBestSellers(): array {
        $stmt = $this->db->query("
            SELECT p.nome, SUM(ip.quantidade) AS total_vendido
            FROM Produtos p
            JOIN Itens_Pedido ip  ON ip.produto_id = p.id
            JOIN Pedidos ped      ON ped.id = ip.pedido_id
            WHERE p.status = 1
              AND ped.status IN ('pago','enviado','entregue')
            GROUP BY p.id
            ORDER BY total_vendido DESC
            LIMIT 6
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
