<?php

require_once __DIR__ . '/../core/connection.php';

class AdminCouponRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        try {
            $stmt = $this->db->query('
                SELECT id, codigo, tipo_desconto, desconto, data_validade, ativo, quant_usos, max_usos
                FROM Cupons
            ');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_CUPON', 0, $e);
        }
    }

    public function create(array $coupon): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Cupons (codigo, tipo_desconto, desconto, data_validade, ativo, quant_usos, max_usos)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $coupon['codigo'],
                $coupon['tipo_desconto'],
                $coupon['desconto'],
                $coupon['data_validade'],
                $coupon['ativo'],
                $coupon['quant_usos'],
                $coupon['max_usos'],
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id'             => $id,
                'codigo'         => $coupon['codigo'],
                'tipo_desconto'  => $coupon['tipo_desconto'],
                'desconto'       => $coupon['desconto'],
                'data_validade'  => $coupon['data_validade'],
                'ativo'          => $coupon['ativo'],
                'quant_usos'     => $coupon['quant_usos'],
                'max_usos'       => $coupon['max_usos'],
            ];
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("CUPON_JA_EXISTE", 0, $e);
            }

            throw new RuntimeException('ERRO_INSERT_CUPON: ' . $e->getMessage(), 0, $e);
        }
    }

    public function update(int $id, array $coupon): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Cupons SET codigo = ?, tipo_desconto = ?, desconto = ?, data_validade = ?, ativo = ?, quant_usos = ?, max_usos = ?
                WHERE id = ?
            ');

            $stmt->execute([
                $coupon['codigo'],
                $coupon['tipo_desconto'],
                $coupon['desconto'],
                $coupon['data_validade'],
                $coupon['ativo'],
                $coupon['quant_usos'],
                $coupon['max_usos'],
                $id,
            ]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("CUPON_JA_EXISTE", 0, $e);
            }
            throw new RuntimeException('ERRO_UPDATE_CUPON: ' . $e->getMessage(), 0, $e);
        }
    }

    public function delete(int $id): bool {
        try {
            $stmt = $this->db->prepare('
                DELETE FROM Cupons WHERE id = ?
            ');
            $stmt->execute([$id]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('CUPON_EM_USO', 0, $e);
            }

            throw new RuntimeException('ERRO_DELETE_CUPON', 0, $e);
        }
    }

}