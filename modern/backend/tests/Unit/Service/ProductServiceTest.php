<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/ProductService.php';

#[AllowMockObjectsWithoutExpectations]
class ProductServiceTest extends TestCase
{
    private function makeRepo(): ProductRepository
    {
        return $this->createMock(ProductRepository::class);
    }

    private function produtoFixture(int $id = 1): array
    {
        return ['id' => $id, 'nome' => 'Camiseta', 'preco' => 49.90, 'estoque' => 10, 'status' => 1];
    }

    // ─── getProductById ──────────────────────────────────────────────────────

    public function test_getProductById_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProductById')->willReturn(null);

        $result = (new ProductService($repo))->getProductById(999);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('999', $result['error']);
    }

    public function test_getProductById_sucesso_retorna_produto(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProductById')->willReturn($this->produtoFixture());

        $result = (new ProductService($repo))->getProductById(1);
        $this->assertArrayHasKey('product', $result);
        $this->assertEquals('Camiseta', $result['product']['nome']);
    }

    // ─── getProductBySlug ────────────────────────────────────────────────────

    public function test_getProductBySlug_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProductBySlug')->willReturn(null);

        $result = (new ProductService($repo))->getProductBySlug('nao-existe');
        $this->assertArrayHasKey('error', $result);
    }

    public function test_getProductBySlug_sucesso_retorna_produto(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProductBySlug')->willReturn($this->produtoFixture());

        $result = (new ProductService($repo))->getProductBySlug('camiseta');
        $this->assertArrayHasKey('product', $result);
    }

    // ─── getAllProducts ───────────────────────────────────────────────────────

    public function test_getAllProducts_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllProducts')->willReturn([$this->produtoFixture(), $this->produtoFixture(2)]);

        $result = (new ProductService($repo))->getAllProducts();
        $this->assertArrayHasKey('products', $result);
        $this->assertCount(2, $result['products']);
    }

    // ─── getHighlights ───────────────────────────────────────────────────────

    public function test_getHighlights_retorna_best_sellers_e_new_arrivals(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getHighlights')->willReturn([
            'best_sellers' => [$this->produtoFixture()],
            'new_arrivals' => [$this->produtoFixture(2)],
        ]);

        $result = (new ProductService($repo))->getHighlights();
        $this->assertArrayHasKey('best_sellers', $result);
        $this->assertArrayHasKey('new_arrivals', $result);
    }

    // ─── toggleDestaque ──────────────────────────────────────────────────────

    public function test_toggleDestaque_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('toggleDestaque')->willReturn(null);

        $result = (new ProductService($repo))->toggleDestaque(999);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_toggleDestaque_sucesso_retorna_estado(): void
    {
        $repo = $this->makeRepo();
        $repo->method('toggleDestaque')->willReturn(['id' => 1, 'destaque' => 1]);

        $result = (new ProductService($repo))->toggleDestaque(1);
        $this->assertArrayHasKey('destaque', $result);
        $this->assertTrue($result['destaque']);
    }
}
