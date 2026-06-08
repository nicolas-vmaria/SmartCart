<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/CartService.php';

#[AllowMockObjectsWithoutExpectations]
class CartServiceTest extends TestCase
{
    private function makeRepo(): CartRepository
    {
        return $this->createMock(CartRepository::class);
    }

    private function produtoFixture(bool $status = true, int $estoque = 10): array
    {
        return ['id' => 1, 'nome' => 'Camiseta', 'preco' => 49.90, 'status' => $status, 'estoque' => $estoque];
    }

    // ─── addItem ─────────────────────────────────────────────────────────────

    public function test_addItem_campos_ausentes_retorna_erro(): void
    {
        $result = (new CartService($this->makeRepo()))->addItem([]);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_addItem_produto_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn(false);

        $result = (new CartService($repo))->addItem([
            'produto_id' => 99, 'quantidade' => 1, 'usuario_id' => 1,
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Produto não encontrado', $result['error']);
    }

    public function test_addItem_produto_inativo_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn($this->produtoFixture(false));

        $result = (new CartService($repo))->addItem([
            'produto_id' => 1, 'quantidade' => 1, 'usuario_id' => 1,
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Produto indisponível', $result['error']);
    }

    public function test_addItem_estoque_insuficiente_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn($this->produtoFixture(true, 2));

        $result = (new CartService($repo))->addItem([
            'produto_id' => 1, 'quantidade' => 5, 'usuario_id' => 1,
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Quantidade insuficiente', $result['error']);
    }

    public function test_addItem_cria_carrinho_quando_nenhum_ativo(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn($this->produtoFixture());
        $repo->method('findCarrinhoAtivo')->willReturn(false);
        $repo->method('createCarrinho')->willReturn(42);
        $repo->expects($this->once())->method('addItem')->with(42, 1, 1);

        $result = (new CartService($repo))->addItem([
            'produto_id' => 1, 'quantidade' => 1, 'usuario_id' => 1,
        ]);
        $this->assertArrayHasKey('message', $result);
    }

    public function test_addItem_usa_carrinho_existente(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn($this->produtoFixture());
        $repo->method('findCarrinhoAtivo')->willReturn(['id' => 7]);
        $repo->expects($this->once())->method('addItem')->with(7, 1, 2);

        $result = (new CartService($repo))->addItem([
            'produto_id' => 1, 'quantidade' => 2, 'usuario_id' => 1,
        ]);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── updateItem ──────────────────────────────────────────────────────────

    public function test_updateItem_quantidade_zero_retorna_erro(): void
    {
        $result = (new CartService($this->makeRepo()))->updateItem(1, ['quantidade' => 0]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Quantidade inválida', $result['error']);
    }

    public function test_updateItem_quantidade_nula_retorna_erro(): void
    {
        $result = (new CartService($this->makeRepo()))->updateItem(1, []);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_updateItem_estoque_insuficiente_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateItem')->willReturn(false);

        $result = (new CartService($repo))->updateItem(1, ['quantidade' => 99]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('insuficiente', $result['error']);
    }

    public function test_updateItem_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateItem')->willReturn(true);

        $result = (new CartService($repo))->updateItem(1, ['quantidade' => 2]);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── removeItem ──────────────────────────────────────────────────────────

    public function test_removeItem_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findItemById')->willReturn(false);

        $result = (new CartService($repo))->removeItem(999);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Item não encontrado', $result['error']);
    }

    public function test_removeItem_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findItemById')->willReturn(['id' => 1, 'produto_id' => 1, 'quantidade' => 1]);
        $repo->expects($this->once())->method('removeItem');

        $result = (new CartService($repo))->removeItem(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getCart ─────────────────────────────────────────────────────────────

    public function test_getCart_vazio_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCart')->willReturn([]);

        $result = (new CartService($repo))->getCart(1);
        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Carrinho vazio', $result['message']);
    }

    public function test_getCart_com_itens_retorna_carrinho(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getCart')->willReturn([
            ['produto_id' => 1, 'nome' => 'Camiseta', 'quantidade' => 2],
        ]);

        $result = (new CartService($repo))->getCart(1);
        $this->assertArrayHasKey('carrinho', $result);
        $this->assertCount(1, $result['carrinho']);
    }

    // ─── clearCart ───────────────────────────────────────────────────────────

    public function test_clearCart_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->expects($this->once())->method('clearCart');

        $result = (new CartService($repo))->clearCart(1);
        $this->assertArrayHasKey('message', $result);
    }
}
