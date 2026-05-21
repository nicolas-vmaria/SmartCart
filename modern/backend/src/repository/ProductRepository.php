<?php 

require_once __DIR__ . '/../core/connection.php';

class ProductRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getAllProducts(): array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos
        ');
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getProductById(int $id): ?array {
        $stmt = $this->db->prepare('
            SELECT * FROM Produtos WHERE id = ?
        ');
        $stmt->execute([$id]);

        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
