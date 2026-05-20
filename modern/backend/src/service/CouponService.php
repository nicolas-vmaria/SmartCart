<?php

require_once __DIR__ . '/../repository/CouponRepository.php';

class CouponService {
    private CouponRepository $repository;

    public function __construct() {
        $this->repository = new CouponRepository();
    }

    public function validateCoupon(array $body): array {
        $codigo = isset($body['codigo']) ? strtoupper(trim((string)$body['codigo'])) : '';

        if (!$codigo) {
            http_response_code(400);
            return ['error' => 'O campo codigo é obrigatório'];
        }

        try {
            $coupon = $this->repository->findByCode($codigo);

            if (!$coupon) {
                http_response_code(404);
                return ['error' => 'Cupom não encontrado'];
            }

            if (!$coupon['ativo']) {
                http_response_code(422);
                return ['error' => 'Cupom inativo'];
            }

            if (new DateTime() > new DateTime($coupon['data_validade'])) {
                http_response_code(422);
                return ['error' => 'Cupom expirado'];
            }

            if ($coupon['max_usos'] !== null && $coupon['quant_usos'] >= $coupon['max_usos']) {
                http_response_code(422);
                return ['error' => 'Cupom atingiu o limite de usos'];
            }

            http_response_code(200);
            return [
                'message' => 'Cupom válido',
                'coupon' => [
                    'codigo'        => $coupon['codigo'],
                    'tipo_desconto' => $coupon['tipo_desconto'],
                    'desconto'      => $coupon['desconto'],
                ],
            ];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao validar cupom: ' . $e->getMessage()];
        }
    }
}
