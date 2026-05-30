<?php

require_once __DIR__ . '/../core/connection.php';

class AdminCurriculosRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(?string $search, ?string $status): array {
        try {
            $conditions = [];
            $params     = [];

            if ($search) {
                $conditions[] = '(a.nome LIKE ? OR a.email LIKE ? OR t.cargo LIKE ?)';
                $like         = "%$search%";
                $params[]     = $like;
                $params[]     = $like;
                $params[]     = $like;
            }

            if ($status) {
                $conditions[] = 'a.status = ?';
                $params[]     = $status;
            }

            $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';

            $stmt = $this->db->prepare("
                SELECT
                    a.id, a.nome, a.email, a.tel,
                    COALESCE(t.area, a.area_interesse) AS area,
                    a.curriculo_url, a.portfolio_url,
                    a.created_at, a.status,
                    t.cargo, t.nome AS vaga_nome
                FROM Aplicacao a
                LEFT JOIN Trabalho t ON a.trabalho_id = t.id
                {$where}
                ORDER BY a.created_at DESC
            ");
            $stmt->execute($params);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_CURRICULOS', 0, $e);
        }
    }

    public function countByStatus(): array {
        try {
            $stmt = $this->db->query("
                SELECT
                    COUNT(*)                                    AS total,
                    COALESCE(SUM(status = 'novo'),         0)  AS novos,
                    COALESCE(SUM(status = 'em_analise'),   0)  AS em_analise,
                    COALESCE(SUM(status = 'aprovado'),     0)  AS aprovados
                FROM Aplicacao
            ");

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_CONTAR_CURRICULOS', 0, $e);
        }
    }

    public function findById(int $id): array|false {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    a.id, a.nome, a.email, a.tel,
                    COALESCE(t.area, a.area_interesse) AS area,
                    a.curriculo_url, a.portfolio_url,
                    a.carta_apresent, a.created_at, a.status,
                    t.cargo, t.nome AS vaga_nome
                FROM Aplicacao a
                LEFT JOIN Trabalho t ON a.trabalho_id = t.id
                WHERE a.id = ?
            ");
            $stmt->execute([$id]);

            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_CURRICULO', 0, $e);
        }
    }

    public function updateStatus(int $id, string $status): bool {
        try {
            $stmt = $this->db->prepare('UPDATE Aplicacao SET status = ? WHERE id = ?');
            $stmt->execute([$status, $id]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_STATUS', 0, $e);
        }
    }

    public function delete(int $id): bool {
        try {
            $stmt = $this->db->prepare('DELETE FROM Aplicacao WHERE id = ?');
            $stmt->execute([$id]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_DELETE_CURRICULO', 0, $e);
        }
    }
}