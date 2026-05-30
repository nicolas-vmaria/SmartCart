<?php 

require_once __DIR__ . '/../service/ReportsService.php';
require_once __DIR__ . '/BaseController.php';

class ReportsController extends BaseController {
    private $reportsService;

    public function __construct() {
        $this->reportsService = new ReportsService();
    }

    public function showInfo($period) {
        $result = $this->reportsService->getReportInfo($period);
        $this->respond($result, 200);
    }

    public function showGraphic($period) {
        $reportGraphic = $this->reportsService->getReportGraphic($period);
        $this->respond($reportGraphic, 200);
    }

    public function showProducts($period) {
        $reportProducts = $this->reportsService->getReportProducts($period);
        $this->respond($reportProducts, 200);
    }
}