<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminReviewService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminReviewServiceTest extends TestCase
{
    private function makeRepo(): AdminReviewRepository
    {
        return $this->createMock(AdminReviewRepository::class);
    }

    // ─── bulkDelete ──────────────────────────────────────────────────────────

    public function test_bulkDelete_ids_vazios_retorna_erro(): void
    {
        $result = (new AdminReviewService($this->makeRepo()))->bulkDelete([]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('ID', $result['error']);
    }

    public function test_bulkDelete_sucesso_retorna_contagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('bulkDeleteReviews')->willReturn(3);

        $result = (new AdminReviewService($repo))->bulkDelete([1, 2, 3]);
        $this->assertArrayHasKey('message', $result);
        $this->assertStringContainsString('3', $result['message']);
    }

    // ─── delete ──────────────────────────────────────────────────────────────

    public function test_delete_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteReview')->willReturn(false);

        $result = (new AdminReviewService($repo))->delete(999);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Review não encontrado', $result['error']);
    }

    public function test_delete_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteReview')->willReturn(true);

        $result = (new AdminReviewService($repo))->delete(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── addPalavra ──────────────────────────────────────────────────────────

    public function test_addPalavra_vazia_retorna_erro(): void
    {
        $result = (new AdminReviewService($this->makeRepo()))->addPalavra('   ');
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('vazia', $result['error']);
    }

    public function test_addPalavra_duplicada_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('addPalavraProibida')->willThrowException(new InvalidArgumentException('Duplicate'));

        $result = (new AdminReviewService($repo))->addPalavra('ruim');
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('existe', $result['error']);
    }

    public function test_addPalavra_sucesso_retorna_palavra(): void
    {
        $repo = $this->makeRepo();
        $repo->method('addPalavraProibida')->willReturn(['id' => 1, 'palavra' => 'ruim']);

        $result = (new AdminReviewService($repo))->addPalavra('ruim');
        $this->assertArrayHasKey('palavra', $result);
    }

    // ─── deletePalavra ───────────────────────────────────────────────────────

    public function test_deletePalavra_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deletePalavraProibida')->willReturn(false);

        $result = (new AdminReviewService($repo))->deletePalavra(999);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Palavra não encontrada', $result['error']);
    }

    public function test_deletePalavra_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deletePalavraProibida')->willReturn(true);

        $result = (new AdminReviewService($repo))->deletePalavra(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getPalavras ─────────────────────────────────────────────────────────

    public function test_getPalavras_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([
            ['id' => 1, 'palavra' => 'ruim'],
        ]);

        $result = (new AdminReviewService($repo))->getPalavras();
        $this->assertArrayHasKey('palavras', $result);
        $this->assertCount(1, $result['palavras']);
    }

    // ─── getAll ──────────────────────────────────────────────────────────────

    public function test_getAll_retorna_stats_e_reviews(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getStats')->willReturn(['total' => 5, 'media' => 4]);
        $repo->method('getAllReviews')->willReturn([['id' => 1, 'nota' => 5]]);

        $result = (new AdminReviewService($repo))->getAll(null, null);
        $this->assertArrayHasKey('stats', $result);
        $this->assertArrayHasKey('reviews', $result);
    }
}
