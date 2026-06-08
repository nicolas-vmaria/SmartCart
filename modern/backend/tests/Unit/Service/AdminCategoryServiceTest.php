<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminCategoryService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminCategoryServiceTest extends TestCase
{
    private function makeRepo(): AdminCategoryRepository
    {
        return $this->createMock(AdminCategoryRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge(['nome' => 'Camisetas', 'descricao' => 'Linha de camisetas'], $overrides);
    }

    // ─── createCategory ───────────────────────────────────────────────────────

    public function test_createCategory_nome_vazio_retorna_erro(): void
    {
        $result = (new AdminCategoryService($this->makeRepo()))
            ->createCategory($this->bodyValido(['nome' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nome', $result['error']);
    }

    public function test_createCategory_descricao_vazia_retorna_erro(): void
    {
        $result = (new AdminCategoryService($this->makeRepo()))
            ->createCategory($this->bodyValido(['descricao' => '']));
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createCategory_nome_duplicado_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('insertCategory')->willThrowException(new Exception('CATEGORIA_JA_EXISTE'));

        $result = (new AdminCategoryService($repo))->createCategory($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('existe', $result['error']);
    }

    public function test_createCategory_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->expects($this->once())->method('insertCategory');

        $result = (new AdminCategoryService($repo))->createCategory($this->bodyValido());
        $this->assertArrayHasKey('message', $result);
        $this->assertStringContainsString('Camisetas', $result['message']);
    }

    // ─── deleteCategory ───────────────────────────────────────────────────────

    public function test_deleteCategory_id_invalido_retorna_erro(): void
    {
        $result = (new AdminCategoryService($this->makeRepo()))->deleteCategory('0');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('ID inválido', $result['error']);
    }

    public function test_deleteCategory_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteCategory')->willReturn(false);

        $result = (new AdminCategoryService($repo))->deleteCategory('1');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Categoria não encontrada', $result['error']);
    }

    public function test_deleteCategory_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteCategory')->willReturn(true);

        $result = (new AdminCategoryService($repo))->deleteCategory('1');
        $this->assertArrayHasKey('message', $result);
    }

    // ─── updateCategory ──────────────────────────────────────────────────────

    public function test_updateCategory_id_invalido_retorna_erro(): void
    {
        $result = (new AdminCategoryService($this->makeRepo()))->updateCategory('-1', $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('ID inválido', $result['error']);
    }

    public function test_updateCategory_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateCategory')->willReturn(false);

        $result = (new AdminCategoryService($repo))->updateCategory('1', $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Categoria não encontrada', $result['error']);
    }

    public function test_updateCategory_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateCategory')->willReturn(true);

        $result = (new AdminCategoryService($repo))->updateCategory('1', $this->bodyValido());
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getAllCategories ─────────────────────────────────────────────────────

    public function test_getAllCategories_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllCategories')->willReturn([['id' => 1, 'nome' => 'Camisetas', 'total' => 5]]);

        $result = (new AdminCategoryService($repo))->getAllCategories();
        $this->assertIsArray($result);
    }
}
