<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminRolesService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminRolesServiceTest extends TestCase
{
    private function makeRepo(): AdminRolesRepository
    {
        return $this->createMock(AdminRolesRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'nome_papel'        => 'Gerente',
            'badge'             => 'blue',
            'descricao'         => 'Gerente de loja',
            'ver_dashboard'     => 'true',
            'ver_clientes'      => 'false',
            'ver_produtos'      => 'true',
            'ver_pedidos'       => 'false',
            'ver_categorias'    => 'false',
            'ver_admin'         => 'false',
            'ver_curriculos'    => 'false',
            'ver_trabalhos'     => 'false',
            'ver_cupons'        => 'false',
            'ver_relatorios'    => 'false',
            'ver_customizacao'  => 'false',
            'ver_usuarios'      => 'false',
            'ver_configuracoes' => 'false',
            'ver_marketing'     => 'false',
            'ver_reviews'       => 'false',
        ], $overrides);
    }

    private function roleCriada(): array
    {
        return ['id' => 1, 'nome_papel' => 'Gerente', 'badge' => 'blue'];
    }

    // ─── validateRole (via createRole) ───────────────────────────────────────

    public function test_createRole_nome_papel_vazio_retorna_erro(): void
    {
        $result = (new AdminRolesService($this->makeRepo()))
            ->createRole($this->bodyValido(['nome_papel' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatórios', $result['error']);
    }

    public function test_createRole_badge_vazio_retorna_erro(): void
    {
        $result = (new AdminRolesService($this->makeRepo()))
            ->createRole($this->bodyValido(['badge' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatórios', $result['error']);
    }

    public function test_createRole_nome_duplicado_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createRole')->willThrowException(new RuntimeException('PAPEL_JA_EXISTE'));

        $result = (new AdminRolesService($repo))->createRole($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
    }

    public function test_createRole_sucesso_retorna_role(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createRole')->willReturn($this->roleCriada());

        $result = (new AdminRolesService($repo))->createRole($this->bodyValido());
        $this->assertArrayHasKey('role', $result);
        $this->assertStringContainsString('Gerente', $result['message']);
    }

    // ─── updateRole ──────────────────────────────────────────────────────────

    public function test_updateRole_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateRole')->willReturn(false);

        $result = (new AdminRolesService($repo))->updateRole(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
    }

    public function test_updateRole_sucesso_retorna_role(): void
    {
        $repo = $this->makeRepo();
        $repo->method('updateRole')->willReturn(true);

        $result = (new AdminRolesService($repo))->updateRole(1, $this->bodyValido());
        $this->assertArrayHasKey('role', $result);
    }

    // ─── deleteRole ──────────────────────────────────────────────────────────

    public function test_deleteRole_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteRole')->willReturn(false);

        $result = (new AdminRolesService($repo))->deleteRole(99);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_deleteRole_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('deleteRole')->willReturn(true);

        $result = (new AdminRolesService($repo))->deleteRole(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getAllRoles ──────────────────────────────────────────────────────────

    public function test_getAllRoles_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findAllRoles')->willReturn([$this->roleCriada()]);

        $result = (new AdminRolesService($repo))->getAllRoles();
        $this->assertArrayHasKey('roles', $result);
        $this->assertCount(1, $result['roles']);
    }

    // ─── permissões convertidas corretamente ─────────────────────────────────

    public function test_validateRole_permissoes_string_true_convertidas_para_1(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createRole')->willReturnCallback(fn($role) => $role);

        $result = (new AdminRolesService($repo))->createRole($this->bodyValido(['ver_dashboard' => 'true']));
        $this->assertEquals(1, $result['role']['ver_dashboard']);
    }

    public function test_validateRole_permissoes_string_false_convertidas_para_0(): void
    {
        $repo = $this->makeRepo();
        $repo->method('createRole')->willReturnCallback(fn($role) => $role);

        $result = (new AdminRolesService($repo))->createRole($this->bodyValido(['ver_clientes' => 'false']));
        $this->assertEquals(0, $result['role']['ver_clientes']);
    }
}
