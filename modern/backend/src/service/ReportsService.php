<?php 

require_once __DIR__ . '/../repository/ReportsRepository.php';

class ReportsService {
    private $reportsRepository;

    public function __construct() {
        $this->reportsRepository = new ReportsRepository();
    }

    public function getReportInfo($period) {
        return $this->reportsRepository->fetchReportInfo($period);
    }

    public function getReportGraphic($period) {
        return $this->reportsRepository->fetchReportGraphic($period);
    }

    public function getReportProducts($period) {
        return $this->reportsRepository->fetchReportProducts($period);
    }
}