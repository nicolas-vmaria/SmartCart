<?php

require_once __DIR__ . '/../core/connection.php';

class CartRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findProdutoBySlug(string $slug): array|false {
        $stmt = $this->db->prepare('SELECT id, nome, preco, estoque, status FROM Produtos WHERE slug = ?');
        $stmt->execute([$slug]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findCarrinhoAtivo(int $usuario_id): array|false {
        $stmt = $this->db->prepare(
            "SELECT id FROM Carrinhos WHERE usuario_id = ? AND status = 'ativo' LIMIT 1"
        );
        $stmt->execute([$usuario_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function addItem(int $carrinho_id, int $produtoId, int $quantidade): void {
        $stmt = $this->db->prepare('
            INSERT INTO Iten_Carrinho (carrinho_id, produto_id, quantidade)
            VALUES (?, ?, ?)
        ');
        $stmt->execute([$carrinho_id, $produtoId, $quantidade]);
    }

}