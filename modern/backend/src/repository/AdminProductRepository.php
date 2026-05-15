<?php

require_once __DIR__ . '/../core/connection.php';

class AdminProductRepository {
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function createProduct(array $product): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Produto (nome, preco, estoque, descricao, foto_url, status)
                VALUES (?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $product['nome'],
                $product['preco'],
                $product['estoque'],
                $product['descricao'],
                $product['foto_url'],
                $product['status']
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id' => $id,
                'nome' => $product['nome'],
                'preco' => $product['preco'],
                'estoque' => $product['estoque'],
                'descricao' => $product['descricao'],
                'foto_url' => $product['foto_url'],
                'status' => $product['status']
            ];
        } catch(Exception $e) {
            throw new RuntimeException('ERRO_INSERT_PRODUCT', 0, $e);
        }

    }
}
