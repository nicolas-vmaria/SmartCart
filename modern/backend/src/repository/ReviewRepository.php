<?php 

require_once __DIR__ . '/../core/connection.php';

class ReviewRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getProductReviews(int $product_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    r.id,
                    r.user_id,
                    r.produto_id,
                    r.nota,
                    r.qtd_likes,
                    r.created_at,
                    u.nome,
                    p.nome,
                    p.foto_url
                FROM Review r
                JOIN Usuario u ON u.id = r.user_id
                JOIN Produtos p ON p.id = r.produto_id
                WHERE r.produto_id = :product_id
                ORDER BY r.created_at DESC
            ");
            $stmt->execute([':product_id' => $product_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_PRODUCT_REVIEWS', 0, $e);
        }
    }

    public function createReview(array $data): int {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO Review (user_id, produto_id, nota, descricao, qtd_likes)
                VALUES (:user_id, :produto_id, :nota, :descricao, :qtd_likes)
            ");
            $stmt->execute([
                ':user_id'     => $data['user_id'],
                ':produto_id'  => $data['produto_id'],
                ':nota'        => $data['nota'],
                ':descricao'   => $data['descricao'],
                ':qtd_likes'   => $data['qtd_likes'],
            ]);
            return (int) $this->db->lastInsertId();
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_CREATE_REVIEW', 0, $e);
        }
    }
}