<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminProductService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminProductServiceTest extends TestCase
{
    private function makeRepo(): AdminProductRepository
    {
        return $this->createMock(AdminProductRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'nome'                => 'Camiseta Verde',
            'categoria_id'        => 1,
            'preco'               => 49.90,
            'estoque'             => 10,
            'status'              => true,
            'descricao'           => 'Uma camiseta bonita',
            'foto_url'            => '',
            'desconto_percentual' => 0,
        ], $overrides);
    }

    private function produtoCriado(): array
    {
        return ['id' => 1, 'nome' => 'Camiseta Verde', 'preco' => 49.90, 'estoque' => 10];
    }

    // ─── createProduct: validateProduct ──────────────────────────────────────

    public function test_createProduct_nome_ausente_retorna_erro(): void
    {
        $result = (new AdminProductService($this->makeRepo()))
            ->createProduct($this->bodyValido(['nome' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatórios', $result['error']);
    }

    public function test_createProduct_categoria_ausente_retorna_erro(): void
    {
        $result = (new AdminProductService($this->makeRepo()))
            ->createProduct($this->bodyValido(['categoria_id' => null]));
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createProduct_preco_negativo_retorna_erro(): void
    {
        $result = (new AdminProductService($this->makeRepo()))
            ->createProduct($this->bodyValido(['preco' => -10]));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('preco', $result['error']);
    }

    public function test_createProduct_estoque_negativo_retorna_erro(): void
    {
        $result = (new AdminProductService($this->makeRepo()))
            ->createProduct($this->bodyValido(['estoque' => -5]));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('estoque', $result['error']);
    }

    public function test_createProduct_status_ausente_retorna_erro(): void
    {
        $body = $this->bodyValido();
        unset($body['status']);
        $result = (new AdminProductService($this->makeRepo()))->createProduct($body);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createProduct_nome_duplicado_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createProduct')->willThrowException(new RuntimeException('PRODUTO_JA_EXISTE'));

        $result = (new AdminProductService($repo))->createProduct($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nome ou slug', $result['error']);
    }

    public function test_createProduct_sucesso_retorna_produto(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createProduct')->willReturn($this->produtoCriado());

        $result = (new AdminProductService($repo))->createProduct($this->bodyValido());
        $this->assertArrayHasKey('product', $result);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── updateProduct ───────────────────────────────────────────────────────

    public function test_updateProduct_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateProduct')->willReturn(false);

        $result = (new AdminProductService($repo))->updateProduct('1', $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Produto não encontrado', $result['error']);
    }

    public function test_updateProduct_sucesso_retorna_produto(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateProduct')->willReturn(true);

        $result = (new AdminProductService($repo))->updateProduct('1', $this->bodyValido());
        $this->assertArrayHasKey('product', $result);
    }

    // ─── deleteProduct ───────────────────────────────────────────────────────

    public function test_deleteProduct_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getFotoUrl')->willReturn(null);
        $repo->method('deleteProduct')->willReturn(false);

        $result = (new AdminProductService($repo))->deleteProduct(99);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Produto não encontrado', $result['error']);
    }

    public function test_deleteProduct_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getFotoUrl')->willReturn(null);
        $repo->method('deleteProduct')->willReturn(true);

        $result = (new AdminProductService($repo))->deleteProduct(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getAllProducts ───────────────────────────────────────────────────────

    public function test_getAllProducts_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllProducts')->willReturn([['id' => 1, 'nome' => 'Camiseta']]);

        $result = (new AdminProductService($repo))->getAllProducts();
        $this->assertArrayHasKey('products', $result);
        $this->assertCount(1, $result['products']);
    }

    // ─── slug gerado corretamente ─────────────────────────────────────────────

    public function test_createProduct_gera_slug_sem_acentos(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createProduct')->willReturnCallback(function ($product) {
            return $product;
        });

        $result = (new AdminProductService($repo))->createProduct($this->bodyValido(['nome' => 'Camiseta Azul']));
        $this->assertArrayHasKey('product', $result);
        $this->assertEquals('camiseta-azul', $result['product']['slug']);
    }
}
