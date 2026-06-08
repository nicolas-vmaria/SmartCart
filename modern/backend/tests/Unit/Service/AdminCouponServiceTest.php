<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminCouponService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminCouponServiceTest extends TestCase
{
    private function makeRepo(): AdminCouponRepository
    {
        return $this->createMock(AdminCouponRepository::class);
    }

    private function bodyValido(array $overrides = []): array
    {
        return array_merge([
            'codigo'        => 'PROMO10',
            'tipo_desconto' => 'percentual',
            'desconto'      => 10.0,
            'data_validade' => date('Y-m-d', strtotime('+30 days')),
            'ativo'         => 'true',
            'quant_usos'    => 0,
            'max_usos'      => '',
        ], $overrides);
    }

    private function cupomCriado(): array
    {
        return ['id' => 1, 'codigo' => 'PROMO10', 'tipo_desconto' => 'percentual', 'desconto' => 10.0];
    }

    // ─── validateCoupon (via createCoupon) ───────────────────────────────────

    public function test_createCoupon_codigo_ausente_retorna_erro(): void
    {
        $result = (new AdminCouponService($this->makeRepo()))
            ->createCoupon($this->bodyValido(['codigo' => '']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('obrigatórios', $result['error']);
    }

    public function test_createCoupon_tipo_invalido_retorna_erro(): void
    {
        $result = (new AdminCouponService($this->makeRepo()))
            ->createCoupon($this->bodyValido(['tipo_desconto' => 'invalido']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('inválido', $result['error']);
    }

    public function test_createCoupon_data_no_passado_retorna_erro(): void
    {
        $result = (new AdminCouponService($this->makeRepo()))
            ->createCoupon($this->bodyValido(['data_validade' => '2000-01-01']));
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('expirado', $result['error']);
    }

    public function test_createCoupon_codigo_duplicado_retorna_409(): void
    {
        $repo = $this->makeRepo();
        $repo->method('create')->willThrowException(new RuntimeException('CUPON_JA_EXISTE'));

        $result = (new AdminCouponService($repo))->createCoupon($this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString("código", $result['error']);
    }

    public function test_createCoupon_sucesso_retorna_cupom(): void
    {
        $repo = $this->makeRepo();
        $repo->method('create')->willReturn($this->cupomCriado());

        $result = (new AdminCouponService($repo))->createCoupon($this->bodyValido());
        $this->assertArrayHasKey('coupon', $result);
        $this->assertStringContainsString('PROMO10', $result['message']);
    }

    // ─── updateCoupon ────────────────────────────────────────────────────────

    public function test_updateCoupon_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('update')->willReturn(false);

        $result = (new AdminCouponService($repo))->updateCoupon(1, $this->bodyValido());
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom não encontrado', $result['error']);
    }

    public function test_updateCoupon_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('update')->willReturn(true);

        $result = (new AdminCouponService($repo))->updateCoupon(1, $this->bodyValido());
        $this->assertArrayHasKey('message', $result);
    }

    // ─── deleteCoupon ────────────────────────────────────────────────────────

    public function test_deleteCoupon_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('delete')->willReturn(false);

        $result = (new AdminCouponService($repo))->deleteCoupon(99);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom não encontrado', $result['error']);
    }

    public function test_deleteCoupon_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('delete')->willReturn(true);

        $result = (new AdminCouponService($repo))->deleteCoupon(1);
        $this->assertArrayHasKey('message', $result);
    }

    // ─── getAllCoupons ────────────────────────────────────────────────────────

    public function test_getAllCoupons_lista_vazia_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findAll')->willReturn([]);

        $result = (new AdminCouponService($repo))->getAllCoupons();
        $this->assertArrayHasKey('message', $result);
    }

    public function test_getAllCoupons_com_dados_retorna_coupons(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findAll')->willReturn([$this->cupomCriado()]);

        $result = (new AdminCouponService($repo))->getAllCoupons();
        $this->assertArrayHasKey('coupons', $result);
        $this->assertCount(1, $result['coupons']);
    }

    // ─── max_usos negativo é normalizado para null ────────────────────────────

    public function test_createCoupon_max_usos_negativo_normalizado_para_null(): void
    {
        $repo = $this->makeRepo();
        $repo->method('create')->willReturnCallback(function ($data) {
            return $data;
        });

        $result = (new AdminCouponService($repo))->createCoupon($this->bodyValido(['max_usos' => -5]));
        $this->assertNull($result['coupon']['max_usos']);
    }
}
