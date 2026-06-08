<?php

require_once __DIR__ . '/../repository/AdminDashboardRepository.php';

class AdminDashboardService {
    private AdminDashboardRepository $repository;

    public function __construct(?AdminDashboardRepository $repo = null) {
        $this->repository = $repo ?? new AdminDashboardRepository();
    }

    public function getDashboard(): array {
        try {
            $ano     = (int) date('Y');
            $summary = $this->repository->getSummary();
            $annual  = $this->repository->getAnnualData($ano);
            $sellers = $this->repository->getBestSellers();

            // Garante os 12 meses mesmo os sem pedidos
            $meses = array_fill(1, 12, ['pedidos' => 0, 'valor' => 0]);
            foreach ($annual as $row) {
                $meses[(int)$row['mes']] = [
                    'pedidos' => (int)   $row['pedidos'],
                    'valor'   => (float) $row['valor'],
                ];
            }
            $faturamento_anual = [];
            for ($m = 1; $m <= 12; $m++) {
                $faturamento_anual[] = [
                    'mes'     => $m,
                    'pedidos' => $meses[$m]['pedidos'],
                    'valor'   => $meses[$m]['valor'],
                ];
            }

            return [
                'faturamento_total'  => (float) $summary['faturamento_total'],
                'pedidos_novos'      => (int)   $summary['pedidos_novos'],
                'faturamento_anual'  => $faturamento_anual,
                'produtos_vendidos'  => $sellers,
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao carregar dashboard'];
        }
    }
}
