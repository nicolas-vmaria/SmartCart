<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/ReviewService.php';

#[AllowMockObjectsWithoutExpectations]
class ReviewServiceTest extends TestCase
{
    private function makeRepo(): ReviewRepository
    {
        return $this->createMock(ReviewRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'user_id'    => 1,
            'produto_id' => 1,
            'nota'       => 5,
            'descricao'  => 'Produto incrível, amei!',
        ], $overrides);
    }

    // ─── createReview ────────────────────────────────────────────────────────

    public function test_createReview_campos_ausentes_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([]);

        $result = (new ReviewService($repo))->createReview([]);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createReview_nota_abaixo_de_1_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([]);

        $result = (new ReviewService($repo))->createReview($this->bodyValido(['nota' => -1]));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Nota inválida', $result['error']);
    }

    public function test_createReview_nota_acima_de_5_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([]);

        $result = (new ReviewService($repo))->createReview($this->bodyValido(['nota' => 6]));
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Nota inválida', $result['error']);
    }

    public function test_createReview_palavra_proibida_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn(['ruim', 'péssimo']);

        $result = (new ReviewService($repo))->createReview($this->bodyValido([
            'descricao' => 'Este produto é péssimo demais',
        ]));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('inadequado', $result['error']);
    }

    public function test_createReview_palavra_proibida_case_insensitive(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn(['ruim']);

        $result = (new ReviewService($repo))->createReview($this->bodyValido([
            'descricao' => 'Muito RUIM este produto',
        ]));
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createReview_duplicada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([]);
        $repo->method('createReview')->willThrowException(new InvalidArgumentException('Duplicate'));

        $result = (new ReviewService($repo))->createReview($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Review já existe', $result['error']);
    }

    public function test_createReview_sucesso_retorna_review(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getPalavrasProibidas')->willReturn([]);
        $repo->method('createReview')->willReturn(['id' => 1, 'nota' => 5, 'descricao' => 'Ótimo!']);

        $result = (new ReviewService($repo))->createReview($this->bodyValido());
        $this->assertArrayHasKey('review', $result);
        $this->assertEquals('Review criada com sucesso', $result['message']);
    }

    // ─── getProductReviews ───────────────────────────────────────────────────

    public function test_getProductReviews_produto_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn(false);

        $result = (new ReviewService($repo))->getProductReviews(99);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Produto não encontrado', $result['error']);
    }

    public function test_getProductReviews_sem_reviews_retorna_array_vazio(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn(['id' => 1, 'nome' => 'Camiseta']);
        $repo->method('getProductReviews')->willReturn([]);

        $result = (new ReviewService($repo))->getProductReviews(1);
        $this->assertArrayHasKey('reviews', $result);
        $this->assertEmpty($result['reviews']);
    }

    public function test_getProductReviews_com_dados_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findProdutoById')->willReturn(['id' => 1, 'nome' => 'Camiseta']);
        $repo->method('getProductReviews')->willReturn([
            ['id' => 1, 'nota' => 5, 'descricao' => 'Ótimo!'],
        ]);

        $result = (new ReviewService($repo))->getProductReviews(1);
        $this->assertArrayHasKey('reviews', $result);
        $this->assertCount(1, $result['reviews']);
    }

    // ─── markHelpful ─────────────────────────────────────────────────────────

    public function test_markHelpful_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('markHelpful')->willReturn(false);

        $result = (new ReviewService($repo))->markHelpful(999);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Review não encontrada', $result['error']);
    }

    public function test_markHelpful_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('markHelpful')->willReturn(true);

        $result = (new ReviewService($repo))->markHelpful(1);
        $this->assertArrayHasKey('message', $result);
    }
}
