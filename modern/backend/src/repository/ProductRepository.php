<?php 

require_once __DIR__ . '/../core/connection.php';

class ProductRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getHighlights(): array {
    $bestSellers = $this->db->prepare('
        SELECT p.*, SUM(ip.quantidade) as total_vendido
        FROM Produtos p
        JOIN Itens_Pedido ip ON ip.produto_id = p.id
        JOIN Pedidos ped ON ped.id = ip.pedido_id
        WHERE p.status = 1
          AND ped.status IN (\'pago\', \'enviado\', \'entregue\')
        GROUP BY p.id
        ORDER BY total_vendido DESC
        LIMIT 8
    ');
    $bestSellers->execute();

    $newArrivals = $this->db->prepare('
        SELECT * FROM Produtos
        WHERE status = 1
        ORDER BY created_at DESC
        LIMIT 8
    ');
    $newArrivals->execute();

    return [
        'best_sellers' => $bestSellers->fetchAll(PDO::FETCH_ASSOC),
        'new_arrivals' => $newArrivals->fetchAll(PDO::FETCH_ASSOC),
    ];
}

    public function getDestaques(): array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos WHERE destaque = 1 AND status = 1 LIMIT 12
        ');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function toggleDestaque(int $id): ?array {
        $stmt = $this->db->prepare('UPDATE Produtos SET destaque = !destaque WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) return null;
        $row = $this->db->prepare('SELECT destaque FROM Produtos WHERE id = ?');
        $row->execute([$id]);
        return $row->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getAllProducts(): array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos WHERE status = 1
        ');
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getProductById(int $id): ?array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos WHERE id = ? AND status = 1
        ');
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function getProductBySlug(string $slug): ?array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos WHERE slug = ? AND status = 1
        ');
        $stmt->execute([$slug]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
