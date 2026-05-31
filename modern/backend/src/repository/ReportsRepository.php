<?php 

require_once __DIR__ . '/../core/connection.php';

class ReportsRepository {
    private $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function fetchReportInfo($period) {
        try {

            switch ($period){
                case '7d' : $period = date('Y-m-d', strtotime('-7 days')); break;
                case '30d' : $period = date('Y-m-d', strtotime('-30 days')); break;
                case '1y' : $period = date('Y-m-d', strtotime('-1 year')); break;
                default : throw new InvalidArgumentException('PERIOD_INVALID');
            }
            
            $stmt = $this->db->prepare('
                SELECT
                    SUM(CASE WHEN p.status IN ("pago","enviado","entregue") THEN p.total ELSE 0 END) as total_sales,
                    COUNT(p.id) as total_orders,
                    COUNT(CASE WHEN p.status = "cancelado" THEN 1 END) as canceled_orders,
                    IFNULL(SUM(CASE WHEN p.status IN ("pago","enviado","entregue") THEN p.total ELSE 0 END) / NULLIF(COUNT(CASE WHEN p.status IN ("pago","enviado","entregue") THEN 1 END), 0), 0) as average_ticket
                FROM Pedidos p
                WHERE p.created_at >= ?
            ');
            $stmt->execute([$period]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            throw new RuntimeException('ERRO_FETCH_REPORT_INFO', 0, $e);
        }
    }

   public function fetchReportProductsGraphic(string $period): array {
    try {
        switch ($period) {
            case '7d':
                $start = date('Y-m-d', strtotime('-7 days'));
                $stmt = $this->db->prepare('
                    SELECT DATE(created_at) AS label, SUM(total) AS total
                    FROM Pedidos
                    WHERE created_at >= ? AND status != "cancelado"
                    GROUP BY DATE(created_at)
                    ORDER BY DATE(created_at) ASC
                ');
                $stmt->execute([$start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date = date('Y-m-d', strtotime("-$i days"));
                    $result[$date] = ['label' => $date, 'total' => '0.00'];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            case '30d':
                $start = date('Y-m-d', strtotime('-30 days'));
                $stmt = $this->db->prepare('
                    SELECT 
                        CONCAT("Semana ", CEIL(DATEDIFF(created_at, ?) / 7)) AS label,
                        SUM(total) AS total
                    FROM Pedidos
                    WHERE created_at >= ? AND status != "cancelado"
                    GROUP BY CEIL(DATEDIFF(created_at, ?) / 7)
                    ORDER BY CEIL(DATEDIFF(created_at, ?) / 7) ASC
                ');
                $stmt->execute([$start, $start, $start, $start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 1; $i <= 4; $i++) {
                    $result["Semana $i"] = ['label' => "Semana $i", 'total' => '0.00'];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            case '1y':
                $start = date('Y-m-d', strtotime('-1 year'));
                $stmt = $this->db->prepare('
                    SELECT DATE_FORMAT(created_at, "%Y-%m") AS label, SUM(total) AS total
                    FROM Pedidos
                    WHERE created_at >= ? AND status != "cancelado"
                    GROUP BY DATE_FORMAT(created_at, "%Y-%m")
                    ORDER BY DATE_FORMAT(created_at, "%Y-%m") ASC
                ');
                $stmt->execute([$start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 11; $i >= 0; $i--) {
                    $month = date('Y-m', strtotime("-$i months"));
                    $result[$month] = ['label' => $month, 'total' => '0.00'];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            default:
                throw new InvalidArgumentException('PERIOD_INVALID');
        }

    } catch (Exception $e) {
        throw new RuntimeException('ERRO_FETCH_REPORT_GRAPHIC', 0, $e);
    }
}

    public function fetchReportOrdersGraphic(string $period): array {
    try {
        switch ($period) {
            case '7d':
                $start = date('Y-m-d', strtotime('-7 days'));
                $stmt = $this->db->prepare('
                    SELECT 
                        DATE(created_at) AS label,
                        COUNT(id) AS total_orders,
                        COUNT(CASE WHEN status = "cancelado" THEN 1 END) AS canceled_orders
                    FROM Pedidos
                    WHERE created_at >= ?
                    GROUP BY DATE(created_at)
                    ORDER BY DATE(created_at) ASC
                ');
                $stmt->execute([$start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 6; $i >= 0; $i--) {
                    $date = date('Y-m-d', strtotime("-$i days"));
                    $result[$date] = ['label' => $date, 'total_orders' => 0, 'canceled_orders' => 0];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            case '30d':
                $start = date('Y-m-d', strtotime('-30 days'));
                $stmt = $this->db->prepare('
                    SELECT 
                        CONCAT("Semana ", CEIL(DATEDIFF(created_at, ?) / 7)) AS label,
                        COUNT(id) AS total_orders,
                        COUNT(CASE WHEN status = "cancelado" THEN 1 END) AS canceled_orders
                    FROM Pedidos
                    WHERE created_at >= ?
                    GROUP BY CEIL(DATEDIFF(created_at, ?) / 7)
                    ORDER BY CEIL(DATEDIFF(created_at, ?) / 7) ASC
                ');
                $stmt->execute([$start, $start, $start, $start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 1; $i <= 4; $i++) {
                    $result["Semana $i"] = ['label' => "Semana $i", 'total_orders' => 0, 'canceled_orders' => 0];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            case '1y':
                $start = date('Y-m-d', strtotime('-1 year'));
                $stmt = $this->db->prepare('
                    SELECT 
                        DATE_FORMAT(created_at, "%Y-%m") AS label,
                        COUNT(id) AS total_orders,
                        COUNT(CASE WHEN status = "cancelado" THEN 1 END) AS canceled_orders
                    FROM Pedidos
                    WHERE created_at >= ?
                    GROUP BY DATE_FORMAT(created_at, "%Y-%m")
                    ORDER BY DATE_FORMAT(created_at, "%Y-%m") ASC
                ');
                $stmt->execute([$start]);
                $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

                $result = [];
                for ($i = 11; $i >= 0; $i--) {
                    $month = date('Y-m', strtotime("-$i months"));
                    $result[$month] = ['label' => $month, 'total_orders' => 0, 'canceled_orders' => 0];
                }
                foreach ($rows as $row) {
                    $result[$row['label']] = $row;
                }
                return array_values($result);

            default:
                throw new InvalidArgumentException('PERIOD_INVALID');
        }

    } catch (Exception $e) {
        throw new RuntimeException('ERRO_FETCH_REPORT_ORDERS_GRAPHIC', 0, $e);
    }
}

    public function fetchReportProducts(string $period): array {
    try {
        switch ($period) {
            case '7d':  $start = date('Y-m-d', strtotime('-7 days')); break;
            case '30d': $start = date('Y-m-d', strtotime('-30 days')); break;
            case '1y':  $start = date('Y-m-d', strtotime('-1 year')); break;
            default: throw new InvalidArgumentException('PERIOD_INVALID');
        }

        $stmt = $this->db->prepare('
            SELECT 
                pr.nome AS produto,
                SUM(ip.quantidade) AS total_vendido,
                SUM(ip.subtotal) AS total_faturado
            FROM Itens_Pedido ip
            JOIN Produtos pr ON pr.id = ip.produto_id
            JOIN Pedidos p ON p.id = ip.pedido_id
            WHERE p.created_at >= ?
            AND p.status != "cancelado"
            GROUP BY ip.produto_id
            ORDER BY total_vendido DESC
            LIMIT 3
        ');
        $stmt->execute([$start]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $totalGeral = array_sum(array_column($rows, 'total_faturado'));

        foreach ($rows as &$row) {
            $row['porcentagem'] = $totalGeral > 0 
                ? round(($row['total_faturado'] / $totalGeral) * 100, 2) : 0;
        }

        return $rows;

    } catch (Exception $e) {
        throw new RuntimeException('ERRO_FETCH_REPORT_PRODUCTS', 0, $e);
    }
}
}
