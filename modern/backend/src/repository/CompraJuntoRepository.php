<?php

require_once __DIR__ . '/../core/connection.php';

class CompraJuntoRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        $stmt = $this->db->query('
            SELECT cj.produto_id, cj.produto_sugerido_id,
                   p1.nome AS produto_nome, p1.foto_url AS produto_foto,
                   p2.nome AS sugerido_nome, p2.foto_url AS sugerido_foto,
                   p2.preco AS sugerido_preco, p2.slug AS sugerido_slug
            FROM CompraJunto cj
            JOIN Produtos p1 ON p1.id = cj.produto_id
            JOIN Produtos p2 ON p2.id = cj.produto_sugerido_id
        ');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByProduto(int $produtoId): ?array {
        $stmt = $this->db->prepare('
            SELECT p.id, p.nome, p.preco, p.foto_url, p.slug
            FROM CompraJunto cj
            JOIN Produtos p ON p.id = cj.produto_sugerido_id
            WHERE cj.produto_id = ?
        ');
        $stmt->execute([$produtoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function set(int $produtoId, int $sugeridoId): void {
        $stmt = $this->db->prepare('
            INSERT INTO CompraJunto (produto_id, produto_sugerido_id)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE produto_sugerido_id = VALUES(produto_sugerido_id)
        ');
        $stmt->execute([$produtoId, $sugeridoId]);
    }

    public function delete(int $produtoId): bool {
        $stmt = $this->db->prepare('DELETE FROM CompraJunto WHERE produto_id = ?');
        $stmt->execute([$produtoId]);
        return $stmt->rowCount() > 0;
    }
}
