<?php

require_once __DIR__ . '/../repository/AdminCouponRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';

class AdminCouponService {  
    private AdminCouponRepository $repository;

    public function __construct(?AdminCouponRepository $repo = null) {
        $this->repository = $repo ?? new AdminCouponRepository();
    }

    public function validateCoupon(array $body): array {
        $codigo = isset($body['codigo']) ? strtoupper(trim((string)$body['codigo'])) : '';
        $tipo_desconto = isset($body['tipo_desconto']) ? strtolower(trim((string)$body['tipo_desconto'])) : '';
        $desconto = isset($body['desconto']) ? (float)$body['desconto'] : null;
        $data_validade = isset($body['data_validade']) ? ucwords(trim(strtolower((string)$body['data_validade']))) : '';
        $ativo = $body['ativo'] === 'true' || $body['ativo'] === '1' ? 1 : 0;
        $quant_usos = isset($body['quant_usos']) ? (int)$body['quant_usos'] : null;
        $max_usos = isset($body['max_usos']) && $body['max_usos'] !== '' ? (int)$body['max_usos'] : null;
        if ($max_usos !== null && $max_usos <= 0) {
            $max_usos = null;
        }

        if (!$codigo || !$tipo_desconto || !$desconto || !$data_validade || $quant_usos === null) {
            throw new InvalidArgumentException("Campos obrigatórios ausentes: codigo, tipo_desconto, desconto, data_validade, ativo, quant_usos");
        }

        if($data_validade < date('Y-m-d')) {
            throw new InvalidArgumentException("Cupom expirado ou data de validade inválida.");
        }

        if(!isset($body[ 'ativo'])) {
            throw new InvalidArgumentException("Campo obrigatório ausente: ativo");
        }

        if (!in_array($tipo_desconto, ['percentual', 'fixo'])) {
            throw new InvalidArgumentException("Tipo de desconto inválido, deve ser 'percentual' ou 'fixo'");
        }

        return [
            'codigo' => $codigo,
            'tipo_desconto' => $tipo_desconto,
            'desconto' => $desconto,
            'data_validade' => $data_validade,
            'ativo' => $ativo,
            'quant_usos' => $quant_usos,
            'max_usos' => $max_usos,
        ];
    }

    public function getAllCoupons() {
        try {
            $coupons = $this->repository->findAll();

            if (!$coupons) {
                http_response_code(200);
                return ['message' => 'Nenhum cupom encontrado'];
            }

            return ['coupons' => $coupons];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar cupons: ' . $e->getMessage()];
        }
    }

    public function createCoupon(array $body, ?array $admin = null): array {
        try {
            $coupon = $this->validateCoupon($body);

            $created = $this->repository->create($coupon);

            http_response_code(201);

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'criar', 'cupom', (int)($created['id'] ?? 0), ['codigo' => $coupon['codigo']]);

            return [
                'message' => "Cupom '{$coupon['codigo']}' criado com sucesso",
                'coupon' => $created
            ];
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'CUPON_JA_EXISTE') {
                http_response_code(409);
                return ['error' => "Já existe um cupom com o código '{$body['codigo']}'"];
            }

            http_response_code(500);
            return ['error' => 'Erro interno ao criar cupom: ' . $e->getMessage()];
        }
    }

    public function updateCoupon(int $id, array $body, ?array $admin = null): array {
        try {
            $coupon = $this->validateCoupon($body);

            $updated = $this->repository->update($id, $coupon);

            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Cupom não encontrado'];
            }

            http_response_code(200);

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'editar', 'cupom', $id, ['codigo' => $coupon['codigo']]);

            return [
                'message' => "Cupom com id $id atualizado com sucesso",
                'coupon' => $coupon
            ];
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'CUPON_JA_EXISTE') {
                http_response_code(409);
                return ['error' => "Já existe um cupom com o código '{$body['codigo']}'"];
            }

            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar cupom: ' . $e->getMessage()];
        }
    }

    public function deleteCoupon($id, ?array $admin = null) {
        try {
            $deleted = $this->repository->delete($id);

            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Cupom não encontrado'];
            }

            http_response_code(200);

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'cupom', (int)$id);

            return ['message' => "Cupom $id removido"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover cupom: ' . $e->getMessage()];
        }
    }
}
