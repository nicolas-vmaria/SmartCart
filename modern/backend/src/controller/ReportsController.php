<?php 

require_once __DIR__ . '/../services/ReportsService.php';
require_once __DIR__ . '/BaseController.php';

class ReportsController extends BaseController {
    private $reportsService;

    public function __construct() {
        $this->reportsService = new ReportsService();
    }

    public function showInfo($period) {
        $reportInfo = $this->reportsService->getReportInfo($period);
        echo json_encode($reportInfo);
    }

    public function showGraphic($period) {
        $reportGraphic = $this->reportsService->getReportGraphic($period);
        echo json_encode($reportGraphic);
    }

    public function showProducts($period) {
        $reportProducts = $this->reportsService->getReportProducts($period);
        echo json_encode($reportProducts);
    }
}