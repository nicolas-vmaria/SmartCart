<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/CouponService.php';

#[AllowMockObjectsWithoutExpectations]
class CouponServiceTest extends TestCase
{
    private function makeRepo(): CouponRepository
    {
        return $this->createMock(CouponRepository::class);
    }

    private function cupomFixture(bool $ativo = true, string $validade = '+1 day', int $maxUsos = 0, int $quantUsos = 0): array
    {
        return [
            'id'            => 1,
            'codigo'        => 'PROMO10',
            'tipo_desconto' => 'percentual',
            'desconto'      => 10.0,
            'ativo'         => $ativo ? 1 : 0,
            'data_validade' => date('Y-m-d H:i:s', strtotime($validade)),
            'max_usos'      => $maxUsos ?: null,
            'quant_usos'    => $quantUsos,
        ];
    }

    public function test_validateCoupon_codigo_vazio_retorna_erro(): void
    {
        $result = (new CouponService($this->makeRepo()))->validateCoupon(['codigo' => '']);
        $this->assertArrayHasKey('error', $result);
    }

    public function test_validateCoupon_cupom_nao_encontrado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn(null);

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'INVALIDO']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom não encontrado', $result['error']);
    }

    public function test_validateCoupon_cupom_inativo_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture(false));

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom inativo', $result['error']);
    }

    public function test_validateCoupon_cupom_expirado_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture(true, '-1 day'));

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10']);
        $this->assertArrayHasKey('error', $result);
        $this->assertEquals('Cupom expirado', $result['error']);
    }

    public function test_validateCoupon_limite_atingido_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture(true, '+1 day', 5, 5));

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10']);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('limite', $result['error']);
    }

    public function test_validateCoupon_ja_usado_pelo_usuario_retorna_erro(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture());
        $repo->method('hasUserUsed')->willReturn(true);

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10', 'usuario_id' => 1]);
        $this->assertArrayHasKey('error', $result);
        $this->assertStringContainsString('já utilizou', $result['error']);
    }

    public function test_validateCoupon_valido_retorna_dados_do_cupom(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture());
        $repo->method('hasUserUsed')->willReturn(false);

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10', 'usuario_id' => 1]);
        $this->assertArrayHasKey('coupon', $result);
        $this->assertEquals('PROMO10', $result['coupon']['codigo']);
        $this->assertEquals('Cupom válido', $result['message']);
    }

    public function test_validateCoupon_sem_usuario_id_pula_verificacao_de_uso(): void
    {
        $repo = $this->makeRepo();
        $repo->method('findByCode')->willReturn($this->cupomFixture());
        $repo->expects($this->never())->method('hasUserUsed');

        $result = (new CouponService($repo))->validateCoupon(['codigo' => 'PROMO10']);
        $this->assertArrayHasKey('coupon', $result);
    }
}
