<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/CandidacyService.php';

#[AllowMockObjectsWithoutExpectations]
class CandidacyServiceTest extends TestCase
{
    private function makeRepo(): CandidacyRepository
    {
        return $this->createMock(CandidacyRepository::class);
    }

    private function vagaFixture(bool $ativa = true): array
    {
        return ['id' => 1, 'cargo' => 'Desenvolvedor PHP', 'ativa' => $ativa ? 1 : 0];
    }

    // ─── candidatar ──────────────────────────────────────────────────────────

    public function test_candidatar_id_invalido_retorna_erro(): void
    {
        $result = (new CandidacyService($this->makeRepo()))->candidatar('0', [
            'nome' => 'João', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('ID inválido', $result['error']);
    }

    public function test_candidatar_nome_vazio_retorna_erro(): void
    {
        $result = (new CandidacyService($this->makeRepo()))->candidatar('1', [
            'nome' => '', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nome', $result['error']);
    }

    public function test_candidatar_email_invalido_retorna_erro(): void
    {
        $result = (new CandidacyService($this->makeRepo()))->candidatar('1', [
            'nome' => 'João', 'email' => 'invalido',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('E-mail', $result['error']);
    }

    public function test_candidatar_vaga_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn(null);

        $result = (new CandidacyService($repo))->candidatar('1', [
            'nome' => 'João', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Vaga não encontrada', $result['error']);
    }

    public function test_candidatar_vaga_inativa_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture(false));

        $result = (new CandidacyService($repo))->candidatar('1', [
            'nome' => 'João', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('disponível', $result['error']);
    }

    public function test_candidatar_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture());
        $repo->expects($this->once())->method('createApplication');

        $result = (new CandidacyService($repo))->candidatar('1', [
            'nome' => 'João', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Candidatura enviada com sucesso', $result['message']);
    }

    // ─── candidaturaEspontanea ───────────────────────────────────────────────

    public function test_espontanea_nome_vazio_retorna_erro(): void
    {
        $result = (new CandidacyService($this->makeRepo()))->candidaturaEspontanea([
            'nome' => '', 'email' => 'joao@test.com',
        ]);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_espontanea_email_invalido_retorna_erro(): void
    {
        $result = (new CandidacyService($this->makeRepo()))->candidaturaEspontanea([
            'nome' => 'João', 'email' => 'nao-e-email',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('E-mail', $result['error']);
    }

    public function test_espontanea_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->expects($this->once())->method('createEspontanea');

        $result = (new CandidacyService($repo))->candidaturaEspontanea([
            'nome' => 'João', 'email' => 'joao@test.com', 'area_interesse' => 'TI',
        ]);
        $this->assertArrayHasKey('message', $result);
        $this->assertEquals('Currículo enviado com sucesso', $result['message']);
    }

    // ─── getAllTrabalhos ──────────────────────────────────────────────────────

    public function test_getAllTrabalhos_retorna_vagas(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllActive')->willReturn([$this->vagaFixture()]);

        $result = (new CandidacyService($repo))->getAllTrabalhos();
        $this->assertArrayHasKey('trabalhos', $result);
        $this->assertCount(1, $result['trabalhos']);
    }

    // ─── getTrabalhoBySlug ────────────────────────────────────────────────────

    public function test_getTrabalhoBySlug_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findBySlug')->willReturn(null);

        $result = (new CandidacyService($repo))->getTrabalhoBySlug('inexistente');
        $this->assertArrayHasKey('error', $result);
    }

    public function test_getTrabalhoBySlug_por_id_numerico_retorna_vaga(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture());

        $result = (new CandidacyService($repo))->getTrabalhoBySlug('1');
        $this->assertArrayHasKey('trabalho', $result);
    }
}
