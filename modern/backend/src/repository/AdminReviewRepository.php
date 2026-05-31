<?php

require_once __DIR__ . '/../core/connection.php';

class AdminReviewRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getStats(): array {
        try {
            $stmt = $this->db->query("
                SELECT
                    COUNT(*)                                                         AS total,
                    ROUND(AVG(nota), 1)                                              AS media_nota,
                    COUNT(CASE WHEN MONTH(created_at) = MONTH(NOW())
                               AND YEAR(created_at)  = YEAR(NOW()) THEN 1 END)       AS reviews_mes
                FROM Review
            ");
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_REVIEW_STATS', 0, $e);
        }
    }

    public function getAllReviews(?string $search, ?int $nota): array {
        try {
            $where  = [];
            $params = [];

            if ($search) {
                $where[]          = '(u.nome LIKE :search OR p.nome LIKE :search)';
                $params[':search'] = '%' . $search . '%';
            }
            if ($nota) {
                $where[]        = 'r.nota = :nota';
                $params[':nota'] = $nota;
            }

            $sql = "
                SELECT
                    r.id,
                    r.nota,
                    r.descricao,
                    r.qtd_likes,
                    r.created_at,
                    r.user_id,
                    r.produto_id,
                    u.nome  AS user_nome,
                    p.nome  AS produto_nome,
                    p.foto_url
                FROM Review r
                JOIN Usuario  u ON u.id = r.user_id
                JOIN Produtos p ON p.id = r.produto_id
            ";
            if ($where) {
                $sql .= ' WHERE ' . implode(' AND ', $where);
            }
            $sql .= ' ORDER BY r.created_at DESC';

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ALL_REVIEWS', 0, $e);
        }
    }

    public function deleteReview(int $id): bool {
        try {
            $stmt = $this->db->prepare('DELETE FROM Review WHERE id = ?');
            $stmt->execute([$id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_DELETE_REVIEW', 0, $e);
        }
    }

    public function bulkDeleteReviews(array $ids): int {
        if (empty($ids)) return 0;
        try {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $this->db->prepare("DELETE FROM Review WHERE id IN ({$placeholders})");
            $stmt->execute(array_values($ids));
            return $stmt->rowCount();
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BULK_DELETE_REVIEWS', 0, $e);
        }
    }

    public function getPalavrasProibidas(): array {
        try {
            $stmt = $this->db->query('SELECT id, palavra, created_at FROM Palavras_Proibidas ORDER BY palavra ASC');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_PALAVRAS', 0, $e);
        }
    }

    public function addPalavraProibida(string $palavra): array {
        try {
            $stmt = $this->db->prepare('INSERT INTO Palavras_Proibidas (palavra) VALUES (?)');
            $stmt->execute([mb_strtolower(trim($palavra))]);
            return ['id' => (int) $this->db->lastInsertId(), 'palavra' => mb_strtolower(trim($palavra))];
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new InvalidArgumentException('PALAVRA_JA_EXISTE', 0, $e);
            }
            throw new RuntimeException('ERRO_ADD_PALAVRA', 0, $e);
        }
    }

    public function deletePalavraProibida(int $id): bool {
        try {
            $stmt = $this->db->prepare('DELETE FROM Palavras_Proibidas WHERE id = ?');
            $stmt->execute([$id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_DELETE_PALAVRA', 0, $e);
        }
    }
}
