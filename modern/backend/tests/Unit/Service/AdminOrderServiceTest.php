<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminOrderService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminOrderServiceTest extends TestCase
{
    private function makeRepo(): AdminOrderRepository
    {
        return $this->createMock(AdminOrderRepository::class);
    }

    private function orderFixture(int $id = 1): array
    {
        return [
            'id'         => $id,
            'nome'       => 'João',
            'email'      => 'joao@test.com',
            'total'      => 149.90,
            'status'     => 'aguardando',
            'created_at' => '2026-01-01 10:00:00',
        ];
    }

    // ─── updateStatus ────────────────────────────────────────────────────────

    public function test_updateStatus_status_invalido_retorna_erro(): void
    {
        $result = (new AdminOrderService($this->makeRepo()))->updateStatus(1, ['status' => 'invalido']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Status inválido', $result['error']);
    }

    public function test_updateStatus_status_vazio_retorna_erro(): void
    {
        $result = (new AdminOrderService($this->makeRepo()))->updateStatus(1, []);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_updateStatus_pedido_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(null);

        $result = (new AdminOrderService($repo))->updateStatus(99, ['status' => 'pago']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Pedido não encontrado', $result['error']);
    }

    public function test_updateStatus_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn($this->orderFixture());
        $repo->method('getOrderItems')->willReturn([]);
        $repo->method('updateStatus')->willReturn(true);

        $result = (new AdminOrderService($repo))->updateStatus(1, ['status' => 'pago']);
        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Status atualizado com sucesso', $result['message']);
    }

    // ─── getOrderById ────────────────────────────────────────────────────────

    public function test_getOrderById_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(null);

        $result = (new AdminOrderService($repo))->getOrderById(99);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Pedido não encontrado', $result['error']);
    }

    public function test_getOrderById_sucesso_inclui_itens(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn($this->orderFixture());
        $repo->method('getOrderItems')->willReturn([['nome' => 'Camiseta', 'quantidade' => 1]]);

        $result = (new AdminOrderService($repo))->getOrderById(1);
        $this->assertArrayHasKey('order', $result);
        $this->assertArrayHasKey('itens', $result['order']);
        $this->assertCount(1, $result['order']['itens']);
    }

    // ─── getAllOrders ─────────────────────────────────────────────────────────

    public function test_getAllOrders_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllOrders')->willReturn([$this->orderFixture()]);

        $result = (new AdminOrderService($repo))->getAllOrders();
        $this->assertArrayHasKey('orders', $result);
        $this->assertCount(1, $result['orders']);
    }

    // ─── getMonthlyAnalytics ──────────────────────────────────────────────────

    public function test_getMonthlyAnalytics_retorna_dados(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getMonthlyAnalytics')->willReturn([
            ['dia' => 1, 'pedidos' => 5, 'total' => 500.0],
        ]);

        $result = (new AdminOrderService($repo))->getMonthlyAnalytics(1, 2026);
        $this->assertArrayHasKey('analytics', $result);
    }
}
