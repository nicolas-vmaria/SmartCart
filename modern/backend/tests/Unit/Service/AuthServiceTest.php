<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AuthService.php';

#[AllowMockObjectsWithoutExpectations]
class AuthServiceTest extends TestCase
{
    private function makeAuthRepo(): AuthRepository
    {
        return $this->createMock(AuthRepository::class);
    }

    private function makeForgotRepo(): forgotPasswordRepository
    {
        return $this->createMock(forgotPasswordRepository::class);
    }

    private function makeService(?AuthRepository $auth = null, ?forgotPasswordRepository $forgot = null): AuthService
    {
        return new AuthService($auth ?? $this->makeAuthRepo(), $forgot ?? $this->makeForgotRepo());
    }

    private function userFixture(string $role = 'cliente', string $senha = 'senha123'): array
    {
        return [
            'id'    => 1,
            'nome'  => 'João',
            'email' => 'joao@test.com',
            'tel'   => '11999999999',
            'senha' => password_hash($senha, PASSWORD_DEFAULT),
            'role'  => $role,
        ];
    }

    // ─── login ───────────────────────────────────────────────────────────────

    public function test_login_campos_vazios_retorna_erro(): void
    {
        $result = $this->makeService()->login(['email' => '', 'senha' => '']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_login_usuario_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn(null);

        $result = $this->makeService($repo)->login(['email' => 'x@x.com', 'senha' => 'abc123']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_login_senha_errada_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn($this->userFixture('cliente', 'correta'));

        $result = $this->makeService($repo)->login(['email' => 'joao@test.com', 'senha' => 'errada']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Credenciais inválidas', $result['error']);
    }

    public function test_login_usuario_admin_bloqueado_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn($this->userFixture('admin'));

        $result = $this->makeService($repo)->login(['email' => 'joao@test.com', 'senha' => 'senha123']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_login_sucesso_retorna_token_e_user(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn($this->userFixture('cliente'));

        $result = $this->makeService($repo)->login(['email' => 'joao@test.com', 'senha' => 'senha123']);
        $this->assertArrayHasKey('token', $result);
        $this->assertArrayHasKey('user', $result);
        $this->assertEquals(1, $result['user']['id']);
    }

    // ─── register ────────────────────────────────────────────────────────────

    public function test_register_nome_vazio_retorna_erro(): void
    {
        $result = $this->makeService()->register(['nome' => '', 'email' => 'x@x.com', 'senha' => 'senha123', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_register_email_invalido_retorna_erro(): void
    {
        $result = $this->makeService()->register(['nome' => 'João', 'email' => 'invalido', 'senha' => 'senha123', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nválid', $result['error']);
    }

    public function test_register_senha_curta_retorna_erro(): void
    {
        $result = $this->makeService()->register(['nome' => 'João', 'email' => 'x@x.com', 'senha' => '123', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('8 caracteres', $result['error']);
    }

    public function test_register_telefone_invalido_retorna_erro(): void
    {
        $result = $this->makeService()->register(['nome' => 'João', 'email' => 'x@x.com', 'senha' => 'senha123', 'tel' => '123']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('Telefone', $result['error']);
    }

    public function test_register_email_duplicado_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn(['id' => 1, 'email' => 'x@x.com']);

        $result = $this->makeService($repo)->register(['nome' => 'João', 'email' => 'x@x.com', 'senha' => 'senha123', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('e-mail', $result['error']);
    }

    public function test_register_sucesso_retorna_mensagem(): void
    {
        $user = $this->userFixture('cliente');
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturnOnConsecutiveCalls(null, $user);
        $repo->method('register')->willReturn($user);

        $result = $this->makeService($repo)->register(['nome' => 'João', 'email' => 'x@x.com', 'senha' => 'senha123', 'tel' => '11999999999']);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── forgotPassword ──────────────────────────────────────────────────────

    public function test_forgotPassword_email_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn(null);

        $result = $this->makeService($repo)->forgotPassword(['email' => 'nao@existe.com']);
        $this->assertArrayHasKey('error', $result);
    }

    // ─── resetPassword ───────────────────────────────────────────────────────

    public function test_resetPassword_token_invalido_retorna_erro(): void
    {
        $forgot = $this->makeForgotRepo();
        $forgot->method('findToken')->willReturn(null);

        $result = $this->makeService($this->makeAuthRepo(), $forgot)
            ->resetPassword(['token' => 'invalido', 'senha' => 'nova123']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('nválid', $result['error']);
    }

    public function test_resetPassword_token_expirado_retorna_erro(): void
    {
        $forgot = $this->makeForgotRepo();
        $forgot->method('findToken')->willReturn([
            'email'     => 'x@x.com',
            'expire_at' => '2000-01-01 00:00:00',
        ]);

        $result = $this->makeService($this->makeAuthRepo(), $forgot)
            ->resetPassword(['token' => 'abc', 'senha' => 'nova123']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('expirado', $result['error']);
    }

    public function test_resetPassword_sucesso_retorna_mensagem(): void
    {
        $forgot = $this->makeForgotRepo();
        $forgot->method('findToken')->willReturn([
            'email'     => 'x@x.com',
            'expire_at' => date('Y-m-d H:i:s', strtotime('+1 hour')),
        ]);
        $forgot->expects($this->once())->method('deleteToken');

        $repo = $this->makeAuthRepo();
        $repo->expects($this->once())->method('updatePassword');

        $result = $this->makeService($repo, $forgot)
            ->resetPassword(['token' => 'validtoken', 'senha' => 'novasenha123']);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── googleLogin ─────────────────────────────────────────────────────────

    public function test_googleLogin_email_vazio_retorna_erro(): void
    {
        $result = $this->makeService()->googleLogin(['email' => '', 'name' => '']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_googleLogin_role_nao_cliente_retorna_erro(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn($this->userFixture('admin'));

        $result = $this->makeService($repo)->googleLogin(['email' => 'admin@test.com', 'name' => 'Admin']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_googleLogin_usuario_existente_retorna_token(): void
    {
        $repo = $this->makeAuthRepo();
        $repo->method('findByEmail')->willReturn($this->userFixture('cliente'));

        $result = $this->makeService($repo)->googleLogin(['email' => 'joao@test.com', 'name' => 'João']);
        $this->assertArrayHasKey('token', $result);
    }
}
