<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminDashboardService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminDashboardServiceTest extends TestCase
{
    private function makeRepo(): AdminDashboardRepository
    {
        return $this->createMock(AdminDashboardRepository::class);
    }

    public function test_getDashboard_retorna_estrutura_completa(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getSummary')->willReturn([
            'faturamento_total' => 15000.0,
            'pedidos_novos'     => 42,
        ]);
        $repo->method('getAnnualData')->willReturn([]);
        $repo->method('getBestSellers')->willReturn([
            ['nome' => 'Camiseta', 'total_vendido' => 120],
        ]);

        $result = (new AdminDashboardService($repo))->getDashboard();

        $this->assertArrayHasKey('faturamento_total', $result);
        $this->assertArrayHasKey('pedidos_novos', $result);
        $this->assertArrayHasKey('faturamento_anual', $result);
        $this->assertArrayHasKey('produtos_vendidos', $result);
    }

    public function test_getDashboard_faturamento_anual_tem_12_meses(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getSummary')->willReturn(['faturamento_total' => 0, 'pedidos_novos' => 0]);
        $repo->method('getAnnualData')->willReturn([]);
        $repo->method('getBestSellers')->willReturn([]);

        $result = (new AdminDashboardService($repo))->getDashboard();

        $this->assertCount(12, $result['faturamento_anual']);
        $this->assertEquals(1, $result['faturamento_anual'][0]['mes']);
        $this->assertEquals(12, $result['faturamento_anual'][11]['mes']);
    }

    public function test_getDashboard_preenche_meses_sem_pedido_com_zero(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getSummary')->willReturn(['faturamento_total' => 500.0, 'pedidos_novos' => 2]);
        $repo->method('getAnnualData')->willReturn([
            ['mes' => 3, 'pedidos' => 5, 'valor' => 500.0],
        ]);
        $repo->method('getBestSellers')->willReturn([]);

        $result = (new AdminDashboardService($repo))->getDashboard();

        $this->assertEquals(0, $result['faturamento_anual'][0]['pedidos']);
        $this->assertEquals(5, $result['faturamento_anual'][2]['pedidos']);
    }
}
