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
                    SUM(p.total) as total_sales,
                    COUNT(p.id) as total_orders,
                    COUNT(CASE WHEN p.status = "cancelado" THEN 1 END) as canceled_orders,
                    IFNULL(SUM(p.total) / COUNT(p.id), 0) as average_ticket
                FROM pedidos p
                WHERE p.data >= ?
            ');
            $stmt->execute([$period]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);

        } catch (Exception $e) {
            throw new RuntimeException('ERRO_FETCH_REPORT_INFO', 0, $e);
        }
    }

    public function fetchReportGraphic($period) {
 
    }

    public function fetchReportProducts($period) {
        
    }
}
