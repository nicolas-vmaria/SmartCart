<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/CategoryService.php';

#[AllowMockObjectsWithoutExpectations]
class CategoryServiceTest extends TestCase
{
    private function makeRepo(): CategoryRepository
    {
        return $this->createMock(CategoryRepository::class);
    }

    private function categoriaFixture(): array
    {
        return ['id' => 1, 'nome' => 'Camisetas', 'slug' => 'camisetas', 'descricao' => 'Camisetas variadas'];
    }

    // ─── getAllCategories ─────────────────────────────────────────────────────

    public function test_getAllCategories_lista_vazia_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findAll')->willReturn([]);

        $result = (new CategoryService($repo))->getAllCategories();
        $this->assertArrayHasKey('error', $result);
    }

    public function test_getAllCategories_com_dados_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findAll')->willReturn([$this->categoriaFixture()]);

        $result = (new CategoryService($repo))->getAllCategories();
        $this->assertArrayHasKey('data', $result);
        $this->assertCount(1, $result['data']);
    }

    // ─── getCategoryBySlug ───────────────────────────────────────────────────

    public function test_getCategoryBySlug_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findBySlug')->willReturn(false);

        $result = (new CategoryService($repo))->getCategoryBySlug('inexistente');
        $this->assertArrayHasKey('error', $result);
    }

    public function test_getCategoryBySlug_sucesso_retorna_categoria_e_produtos(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findBySlug')->willReturn($this->categoriaFixture());
        $repo->method('findProductsBySlug')->willReturn([
            ['id' => 1, 'nome' => 'Camiseta Branca'],
        ]);

        $result = (new CategoryService($repo))->getCategoryBySlug('camisetas');
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('categoria', $result['data']);
        $this->assertArrayHasKey('produtos', $result['data']);
        $this->assertCount(1, $result['data']['produtos']);
    }
}
