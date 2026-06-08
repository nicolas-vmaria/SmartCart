<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminVacanciesService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminVacanciesServiceTest extends TestCase
{
    private function makeRepo(): AdminVacanciesRepository
    {
        return $this->createMock(AdminVacanciesRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'nome'             => 'Desenvolvedor PHP',
            'cargo'            => 'Desenvolvedor',
            'area'             => 'Tecnologia',
            'tipo_contrato'    => 'CLT',
            'formato_trabalho' => 'Remoto',
            'local'            => 'São Paulo',
            'requisitos'       => 'PHP 8+',
            'ativa'            => true,
        ], $overrides);
    }

    private function vagaFixture(int $id = 1): array
    {
        return array_merge(['id' => $id], $this->bodyValido());
    }

    // ─── createVacancy ───────────────────────────────────────────────────────

    public function test_createVacancy_nome_vazio_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))
            ->createVacancy($this->bodyValido(['nome' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nome', $result['error']);
    }

    public function test_createVacancy_nome_muito_longo_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))
            ->createVacancy($this->bodyValido(['nome' => str_repeat('a', 151)]));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('150', $result['error']);
    }

    public function test_createVacancy_tipo_contrato_invalido_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))
            ->createVacancy($this->bodyValido(['tipo_contrato' => 'Inválido']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('tipo_contrato', $result['error']);
    }

    public function test_createVacancy_formato_invalido_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))
            ->createVacancy($this->bodyValido(['formato_trabalho' => 'Nave-espacial']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('formato', $result['error']);
    }

    public function test_createVacancy_nome_duplicado_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByNome')->willReturn(['id' => 2]);

        $result = (new AdminVacanciesService($repo))->createVacancy($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nome', $result['error']);
    }

    public function test_createVacancy_sucesso_retorna_vaga(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByNome')->willReturn(null);
        $repo->method('create')->willReturn($this->vagaFixture());

        $result = (new AdminVacanciesService($repo))->createVacancy($this->bodyValido());
        $this->assertArrayHasKey('vacancy', $result);
        $this->assertStringContainsString('Desenvolvedor PHP', $result['message']);
    }

    // ─── getVacancyById ──────────────────────────────────────────────────────

    public function test_getVacancyById_id_invalido_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))->getVacancyById('0');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('ID inválido', $result['error']);
    }

    public function test_getVacancyById_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn(null);

        $result = (new AdminVacanciesService($repo))->getVacancyById('99');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Vaga não encontrada', $result['error']);
    }

    public function test_getVacancyById_sucesso_retorna_vaga(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture());

        $result = (new AdminVacanciesService($repo))->getVacancyById('1');
        $this->assertArrayHasKey('vacancy', $result);
    }

    // ─── deleteVacancy ───────────────────────────────────────────────────────

    public function test_deleteVacancy_id_invalido_retorna_erro(): void
    {
        $result = (new AdminVacanciesService($this->makeRepo()))->deleteVacancy('0');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('ID inválido', $result['error']);
    }

    public function test_deleteVacancy_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn(null);

        $result = (new AdminVacanciesService($repo))->deleteVacancy('1');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Vaga não encontrada', $result['error']);
    }

    public function test_deleteVacancy_tem_candidaturas_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture());
        $repo->method('hasApplications')->willReturn(true);

        $result = (new AdminVacanciesService($repo))->deleteVacancy('1');
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('candidaturas', $result['error']);
    }

    public function test_deleteVacancy_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->vagaFixture());
        $repo->method('hasApplications')->willReturn(false);
        $repo->expects($this->once())->method('delete');

        $result = (new AdminVacanciesService($repo))->deleteVacancy('1');
        $this->assertArrayHasKey('message', $result);
    }

    // ─── toggleVacancy ───────────────────────────────────────────────────────

    public function test_toggleVacancy_nao_encontrada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('toggleAtiva')->willReturn(null);

        $result = (new AdminVacanciesService($repo))->toggleVacancy('1');
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Vaga não encontrada', $result['error']);
    }

    public function test_toggleVacancy_sucesso_retorna_vaga(): void
    {
        $repo = $this->makeRepo();
        $repo->method('toggleAtiva')->willReturn(array_merge($this->vagaFixture(), ['ativa' => 0]));

        $result = (new AdminVacanciesService($repo))->toggleVacancy('1');
        $this->assertArrayHasKey('vaga', $result);
    }
}
