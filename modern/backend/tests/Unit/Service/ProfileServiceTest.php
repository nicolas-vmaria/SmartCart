<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/ProfileService.php';

#[AllowMockObjectsWithoutExpectations]
class ProfileServiceTest extends TestCase
{
    private function makeRepo(): ProfileRepository
    {
        return $this->createMock(ProfileRepository::class);
    }

    private function userFixture(string $senha = 'senha123'): array
    {
        return ['id' => 1, 'senha' => password_hash($senha, PASSWORD_DEFAULT)];
    }

    private function profileFixture(): array
    {
        return ['id' => 1, 'nome' => 'João', 'tel' => '11999999999', 'email' => 'joao@test.com'];
    }

    // ─── updatePassword ──────────────────────────────────────────────────────

    public function test_updatePassword_campos_ausentes_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updatePassword(1, []);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatórios', $result['error']);
    }

    public function test_updatePassword_senhas_nao_coincidem_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updatePassword(1, [
            'senha_atual'     => 'senha123',
            'nova_senha'      => 'nova123456',
            'confirmar_senha' => 'diferente',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('coincidem', $result['error']);
    }

    public function test_updatePassword_nova_senha_curta_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updatePassword(1, [
            'senha_atual'     => 'senha123',
            'nova_senha'      => '123',
            'confirmar_senha' => '123',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('8 caracteres', $result['error']);
    }

    public function test_updatePassword_senha_atual_incorreta_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->userFixture('correta'));

        $result = (new ProfileService($repo))->updatePassword(1, [
            'senha_atual'     => 'errada',
            'nova_senha'      => 'novasenha123',
            'confirmar_senha' => 'novasenha123',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('incorreta', $result['error']);
    }

    public function test_updatePassword_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findById')->willReturn($this->userFixture('senha123'));
        $repo->expects($this->once())->method('updatePassword');

        $result = (new ProfileService($repo))->updatePassword(1, [
            'senha_atual'     => 'senha123',
            'nova_senha'      => 'novasenha123',
            'confirmar_senha' => 'novasenha123',
        ]);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── updateProfile ───────────────────────────────────────────────────────

    public function test_updateProfile_nome_vazio_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updateProfile(1, ['nome' => '', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_updateProfile_telefone_muito_curto_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updateProfile(1, ['nome' => 'João', 'tel' => '123']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('Telefone', $result['error']);
    }

    public function test_updateProfile_usuario_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProfile')->willReturn(false);

        $result = (new ProfileService($repo))->updateProfile(1, ['nome' => 'João', 'tel' => '11999999999']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Usuário não encontrado', $result['error']);
    }

    public function test_updateProfile_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProfile')->willReturn($this->profileFixture());
        $repo->expects($this->once())->method('updateProfile');

        $result = (new ProfileService($repo))->updateProfile(1, ['nome' => 'João', 'tel' => '11999999999']);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── updateAddress ───────────────────────────────────────────────────────

    public function test_updateAddress_campo_ausente_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updateAddress(1, [
            'cep' => '', 'rua' => 'Av. Paulista', 'numero' => '100',
            'complemento' => 'Apto 1', 'cidade' => 'SP', 'estado' => 'SP',
        ]);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_updateAddress_cep_invalido_retorna_erro(): void
    {
        $result = (new ProfileService($this->makeRepo()))->updateAddress(1, [
            'cep' => '1234', 'rua' => 'Av. Paulista', 'numero' => '100',
            'complemento' => 'Apto 1', 'cidade' => 'SP', 'estado' => 'SP',
        ]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('CEP', $result['error']);
    }

    public function test_updateAddress_sucesso_retorna_endereco(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProfile')->willReturn($this->profileFixture());
        $repo->expects($this->once())->method('updateAddress');

        $result = (new ProfileService($repo))->updateAddress(1, [
            'cep' => '01310-100', 'rua' => 'Av. Paulista', 'numero' => '1000',
            'complemento' => 'Apto 1', 'cidade' => 'São Paulo', 'estado' => 'SP',
        ]);
        $this->assertArrayHasKey('message', $result);
        $this->assertArrayHasKey('address', $result);
    }

    // ─── getProfile ──────────────────────────────────────────────────────────

    public function test_getProfile_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProfile')->willReturn(false);
        $repo->method('getRecentOrders')->willReturn([]);

        $result = (new ProfileService($repo))->getProfile(999);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_getProfile_sucesso_retorna_profile_e_orders(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getProfile')->willReturn($this->profileFixture());
        $repo->method('getRecentOrders')->willReturn([['id' => 1]]);

        $result = (new ProfileService($repo))->getProfile(1);
        $this->assertArrayHasKey('profile', $result);
        $this->assertArrayHasKey('orders', $result);
    }
}
