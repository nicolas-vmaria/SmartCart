<?php 

require_once __DIR__ . '/../core/connection.php';

class ReviewRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findProdutoById(int $product_id): array|false {
        $stmt = $this->db->prepare('SELECT id, nome FROM Produtos WHERE id = ?');
        $stmt->execute([$product_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getProductReviews(int $product_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    r.id,
                    r.user_id,
                    r.produto_id,
                    r.descricao,
                    r.nota,
                    r.qtd_likes,
                    r.created_at,
                    u.nome AS user_nome,
                    p.nome AS produto_nome,
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

    public function createReview(array $data): array {
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
            return [
                 
                        'id'           => (int) $this->db->lastInsertId(),
                        'produto_id'   => $data['produto_id'],
                        'user_id'      => $data['user_id'],
                        'nota'         => $data['nota'],
                        'descricao'    => $data['descricao'],
                        'qtd_likes'    => $data['qtd_likes'],
                    
                ];
                
            } catch (PDOException $e) {
                if($e->getCode() === '23000') {
                    throw new InvalidArgumentException('ERRO_REVIEW_EXISTE', 0, $e);
                }

            throw new RuntimeException('ERRO_CREATE_REVIEW', 0, $e);
        }
    }

    public function markHelpful(int $id): bool {
    try {
        $stmt = $this->db->prepare('
            UPDATE Review SET qtd_likes = qtd_likes + 1 WHERE id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    } catch (PDOException $e) {
        throw new RuntimeException('ERRO_MARK_HELPFUL', 0, $e);
    }
}
}