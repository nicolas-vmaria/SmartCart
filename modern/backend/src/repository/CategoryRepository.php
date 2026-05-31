<?php

require_once __DIR__ . '/../core/connection.php';

class CategoryRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        $stmt = $this->db->query('SELECT id, nome, slug, descricao FROM Categorias ORDER BY nome');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findProductsBySlug(string $slug): array {
        $stmt = $this->db->prepare('
            SELECT p.id, p.nome, p.slug, p.preco, p.estoque, p.descricao, p.foto_url
            FROM Produtos p
            INNER JOIN Categorias c ON p.categoria_id = c.id
            WHERE c.slug = :slug
            AND p.status = TRUE
            ORDER BY p.nome
        ');
        $stmt->execute([':slug' => $slug]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findBySlug(string $slug): array|false {
        $stmt = $this->db->prepare('SELECT id, nome, slug, descricao FROM Categorias WHERE slug = :slug');
        $stmt->execute([':slug' => $slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}