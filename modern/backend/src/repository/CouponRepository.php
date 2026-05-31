<?php

require_once __DIR__ . '/../core/connection.php';

class CouponRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findByCode(string $codigo): ?array {
        try {
            $stmt = $this->db->prepare('
                SELECT id, codigo, tipo_desconto, desconto, data_validade, ativo, quant_usos, max_usos
                FROM Cupons
                WHERE codigo = ?
            ');
            $stmt->execute([$codigo]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_CUPOM: ' . $e->getMessage(), 0, $e);
        }
    }

    public function hasUserUsed(int $cupom_id, int $usuario_id): bool {
        try {
            $stmt = $this->db->prepare('
                SELECT 1 FROM CuponsUsoUsuarios
                WHERE cupom_id = ? AND usuario_id = ?
                LIMIT 1
            ');
            $stmt->execute([$cupom_id, $usuario_id]);
            return $stmt->fetchColumn() !== false;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_VERIFICAR_USO_CUPOM: ' . $e->getMessage(), 0, $e);
        }
    }
}
