<?php 

require_once __DIR__ . '/../repository/ReportsRepository.php';

class ReportsService {
    private $reportsRepository;

    public function __construct(?ReportsRepository $repo = null) {
        $this->reportsRepository = $repo ?? new ReportsRepository();
    }

    public function getReportInfo($period) {
        try{
            return $this->reportsRepository->fetchReportInfo($period);
        } catch (Exception $e) {
            throw new RuntimeException('ERRO_FETCH_REPORT_INFO', 0, $e);
        }
    }

    public function getReportGraphic($period) {
        try {
            $reportGraphicProducts = $this->reportsRepository->fetchReportProductsGraphic($period);
            $reportGraphicOrders = $this->reportsRepository->fetchReportOrdersGraphic($period);
            return ['produtos' => $reportGraphicProducts, 'pedidos' => $reportGraphicOrders];
        } catch (Exception $e) {
            throw new RuntimeException('ERRO_FETCH_REPORT_GRAPHIC', 0, $e);
        }
    }

    public function getReportProducts($period) {
        try {
            return $this->reportsRepository->fetchReportProducts($period);
        } catch (Exception $e) {
            throw new RuntimeException('ERRO_FETCH_REPORT_PRODUCTS', 0, $e);
        }
    }
}