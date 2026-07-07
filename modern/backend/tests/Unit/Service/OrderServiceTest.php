<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/OrderService.php';
require_once __DIR__ . '/../../../src/repository/ConfiguracoesRepository.php';

#[AllowMockObjectsWithoutExpectations]
class OrderServiceTest extends TestCase
{
    private function makeRepo(): OrderRepository
    {
        return $this->createMock(OrderRepository::class);
    }

    private function makeConfigRepo(): ConfiguracoesRepository
    {
        $configRepo = $this->createMock(ConfiguracoesRepository::class);
        $configRepo->method('findAll')->willReturn([]);
        return $configRepo;
    }

    private function makeService(OrderRepository $repo): OrderService
    {
        return new OrderService($repo, $this->makeConfigRepo());
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'metodo_pagamento' => 'pix',
            'cep'              => '01310-100',
            'rua'              => 'Av. Paulista',
            'numero'           => '1000',
            'bairro'           => 'Bela Vista',
            'cidade'           => 'São Paulo',
            'estado'           => 'SP',
        ], $overrides);
    }

    private function itemFixture(bool $status = true, int $estoque = 10): array
    {
        return ['id' => 1, 'nome' => 'Camiseta', 'preco' => 100.0, 'quantidade' => 2, 'status' => $status, 'estoque' => $estoque];
    }

    private function cupomFixture(string $tipo = 'percentual', float $desconto = 10.0, bool $ativo = true, int $quant = 0, ?int $max = null): array
    {
        return [
            'id'            => 1,
            'codigo'        => 'PROMO10',
            'tipo_desconto' => $tipo,
            'desconto'      => $desconto,
            'ativo'         => $ativo ? 1 : 0,
            'data_validade' => date('Y-m-d', strtotime('+1 day')),
            'quant_usos'    => $quant,
            'max_usos'      => $max,
        ];
    }

    // ─── createOrder: validações de body ─────────────────────────────────────

    public function test_createOrder_campo_obrigatorio_ausente_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $result = ($this->makeService($repo))->createOrder(1, ['metodo_pagamento' => 'pix']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatório', $result['error']);
    }

    public function test_createOrder_metodo_pagamento_invalido_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['metodo_pagamento' => 'boleto']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('pagamento', $result['error']);
    }

    public function test_createOrder_sem_carrinho_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(null);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('carrinho', $result['error']);
    }

    public function test_createOrder_carrinho_vazio_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([]);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Carrinho vazio', $result['error']);
    }

    public function test_createOrder_produto_inativo_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture(false)]);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('indisponível', $result['error']);
    }

    public function test_createOrder_estoque_insuficiente_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture(true, 1)]);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('Estoque insuficiente', $result['error']);
    }

    public function test_createOrder_cupom_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $repo->method('findCupom')->willReturn(null);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['codigo_cupom' => 'INVALIDO']));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom não encontrado', $result['error']);
    }

    public function test_createOrder_cupom_inativo_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $repo->method('findCupom')->willReturn($this->cupomFixture('percentual', 10.0, false));

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['codigo_cupom' => 'PROMO10']));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom inativo', $result['error']);
    }

    public function test_createOrder_cupom_expirado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $cupom = $this->cupomFixture();
        $cupom['data_validade'] = date('Y-m-d', strtotime('-1 day'));
        $repo->method('findCupom')->willReturn($cupom);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['codigo_cupom' => 'PROMO10']));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom expirado', $result['error']);
    }

    public function test_createOrder_cupom_esgotado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $repo->method('findCupom')->willReturn($this->cupomFixture('percentual', 10.0, true, 5, 5));

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['codigo_cupom' => 'PROMO10']));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom esgotado', $result['error']);
    }

    public function test_createOrder_cupom_ja_usado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $repo->method('findCupom')->willReturn($this->cupomFixture());
        $repo->method('hasUserUsed')->willReturn(true);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido(['codigo_cupom' => 'PROMO10']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('já utilizou', $result['error']);
    }

    public function test_createOrder_sucesso_retorna_pedido(): void
    {
        $pedido = ['id' => 42, 'total' => 215.90, 'usuario_id' => 1, 'status' => 'aguardando'];
        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn([$this->itemFixture()]);
        $repo->method('createOrder')->willReturn(42);
        $repo->method('getOrderById')->willReturn($pedido);
        $repo->method('getOrderItems')->willReturn([]);

        $result = ($this->makeService($repo))->createOrder(1, $this->bodyValido());
        $this->assertArrayHasKey('pedido', $result);
        $this->assertEquals('Pedido criado com sucesso', $result['message']);
    }

    // ─── cancelOrder ─────────────────────────────────────────────────────────

    public function test_cancelOrder_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(null);

        $result = ($this->makeService($repo))->cancelOrder(99, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Pedido não encontrado', $result['error']);
    }

    public function test_cancelOrder_usuario_errado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 2, 'status' => 'aguardando']);

        $result = ($this->makeService($repo))->cancelOrder(1, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Acesso negado', $result['error']);
    }

    public function test_cancelOrder_status_enviado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 1, 'status' => 'enviado']);

        $result = ($this->makeService($repo))->cancelOrder(1, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('cancelado', $result['error']);
    }

    public function test_cancelOrder_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 1, 'status' => 'aguardando']);
        $repo->expects($this->once())->method('updateStatus')->with(1, 'cancelado', null);

        $result = ($this->makeService($repo))->cancelOrder(1, 1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getOrderById ────────────────────────────────────────────────────────

    public function test_getOrderById_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(null);

        $result = ($this->makeService($repo))->getOrderById(99, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Pedido não encontrado', $result['error']);
    }

    public function test_getOrderById_usuario_errado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 2, 'status' => 'aguardando']);

        $result = ($this->makeService($repo))->getOrderById(1, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Acesso negado', $result['error']);
    }

    public function test_getOrderById_sucesso_inclui_itens(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 1, 'status' => 'aguardando']);
        $repo->method('getOrderItems')->willReturn([['nome' => 'Camiseta', 'quantidade' => 1]]);

        $result = ($this->makeService($repo))->getOrderById(1, 1);
        $this->assertArrayHasKey('pedido', $result);
        $this->assertArrayHasKey('itens', $result['pedido']);
        $this->assertCount(1, $result['pedido']['itens']);
    }

    // ─── getOrderReviewItems ─────────────────────────────────────────────────

    public function test_getOrderReviewItems_pedido_nao_entregue_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 1, 'status' => 'enviado']);

        $result = ($this->makeService($repo))->getOrderReviewItems(1, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('entregue', $result['error']);
    }

    public function test_getOrderReviewItems_usuario_errado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getOrderById')->willReturn(['id' => 1, 'usuario_id' => 2, 'status' => 'entregue']);

        $result = ($this->makeService($repo))->getOrderReviewItems(1, 1);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Acesso negado', $result['error']);
    }

    // ─── calcularFrete (via createOrder) ─────────────────────────────────────

    public function test_frete_gratis_acima_de_500(): void
    {
        $itens = [['nome' => 'TV', 'preco' => 600.0, 'quantidade' => 1, 'status' => true, 'estoque' => 5]];
        $pedido = ['id' => 1, 'total' => 600.0, 'usuario_id' => 1, 'status' => 'aguardando'];

        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn($itens);
        $repo->method('createOrder')->willReturn(1);
        $repo->method('getOrderById')->willReturn($pedido);
        $repo->method('getOrderItems')->willReturn([]);

        $capturedPayload = null;
        $repo->method('createOrder')->willReturnCallback(function ($payload) use (&$capturedPayload) {
            $capturedPayload = $payload;
            return 1;
        });

        ($this->makeService($repo))->createOrder(1, $this->bodyValido(['estado' => 'SP']));
        $this->assertEquals(0.0, $capturedPayload['total'] - 600.0);
    }

    public function test_frete_sp_custa_15_reais(): void
    {
        $itens = [['nome' => 'Camiseta', 'preco' => 100.0, 'quantidade' => 1, 'status' => true, 'estoque' => 5]];
        $pedido = ['id' => 1, 'total' => 115.90, 'usuario_id' => 1, 'status' => 'aguardando'];

        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn($itens);
        $repo->method('getOrderById')->willReturn($pedido);
        $repo->method('getOrderItems')->willReturn([]);

        $capturedPayload = null;
        $repo->method('createOrder')->willReturnCallback(function ($payload) use (&$capturedPayload) {
            $capturedPayload = $payload;
            return 1;
        });

        ($this->makeService($repo))->createOrder(1, $this->bodyValido(['estado' => 'SP']));
        $this->assertEquals(115.90, $capturedPayload['total']);
    }

    public function test_frete_uf_desconhecida_custa_29_reais(): void
    {
        $itens = [['nome' => 'Camiseta', 'preco' => 100.0, 'quantidade' => 1, 'status' => true, 'estoque' => 5]];
        $pedido = ['id' => 1, 'total' => 129.90, 'usuario_id' => 1, 'status' => 'aguardando'];

        $repo = $this->makeRepo();
        $repo->method('getCarrinhoAtivo')->willReturn(['id' => 1]);
        $repo->method('getCarrinhoItens')->willReturn($itens);
        $repo->method('getOrderById')->willReturn($pedido);
        $repo->method('getOrderItems')->willReturn([]);

        $capturedPayload = null;
        $repo->method('createOrder')->willReturnCallback(function ($payload) use (&$capturedPayload) {
            $capturedPayload = $payload;
            return 1;
        });

        ($this->makeService($repo))->createOrder(1, $this->bodyValido(['estado' => 'ZZ']));
        $this->assertEquals(129.90, $capturedPayload['total']);
    }
}
