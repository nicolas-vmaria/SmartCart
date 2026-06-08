<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminAuthService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminAuthServiceTest extends TestCase
{
    private function makeRepo(): AuthRepository
    {
        return $this->createMock(AuthRepository::class);
    }

    private function adminFixture(string $senha = 'admin123', bool $is_admin = true): array
    {
        return [
            'id'               => 1,
            'nome'             => 'Admin',
            'email'            => 'admin@test.com',
            'senha'            => password_hash($senha, PASSWORD_DEFAULT),
            'is_admin'         => $is_admin ? 1 : 0,
            'role'             => 'Administrador',
            'ver_dashboard'    => 1,
            'ver_clientes'     => 1,
            'ver_produtos'     => 1,
            'ver_pedidos'      => 1,
            'ver_categorias'   => 1,
            'ver_admin'        => 1,
            'ver_curriculos'   => 0,
            'ver_trabalhos'    => 0,
            'ver_cupons'       => 0,
            'ver_relatorios'   => 0,
            'ver_usuarios'     => 0,
            'ver_configuracoes'=> 0,
            'ver_customizacao' => 0,
            'ver_marketing'    => 0,
            'ver_reviews'      => 0,
        ];
    }

    public function test_login_usuario_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByEmail')->willReturn(null);

        $result = (new AdminAuthService($repo))->login(['email' => 'x@x.com', 'senha' => 'abc']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Credenciais inválidas', $result['error']);
    }

    public function test_login_senha_errada_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByEmail')->willReturn($this->adminFixture('correta'));

        $result = (new AdminAuthService($repo))->login(['email' => 'admin@test.com', 'senha' => 'errada']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Credenciais inválidas', $result['error']);
    }

    public function test_login_nao_admin_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByEmail')->willReturn($this->adminFixture('admin123', false));

        $result = (new AdminAuthService($repo))->login(['email' => 'admin@test.com', 'senha' => 'admin123']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Acesso negado', $result['error']);
    }

    public function test_login_sucesso_retorna_token_e_permissions(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByEmail')->willReturn($this->adminFixture());

        $result = (new AdminAuthService($repo))->login(['email' => 'admin@test.com', 'senha' => 'admin123']);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertArrayHasKey('permissions', $result['user']);
        $this->assertTrue($result['user']['permissions']['dashboard']);
    }
}
