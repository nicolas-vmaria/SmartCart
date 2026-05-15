<?php

require_once __DIR__ . '/../core/connection.php';

class AdminProductRepository {
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function getAllProducts(): array {
        try {
            $stmt = $this->db->query('SELECT * FROM Produtos');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_PRODUTOS', 0, $e);
        }
    }

    public function createProduct(array $product): array {
        try {
            $status = $product['status'] === 'ativo' ? 1 : 0;

            $stmt = $this->db->prepare('
                INSERT INTO Produtos (categoria_id, nome, preco, estoque, descricao, foto_url, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $product['categoria_id'],
                $product['nome'],
                $product['preco'],
                $product['estoque'],
                $product['descricao'],
                $product['foto_url'],
                $status,
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id'          => $id,
                'categoria_id'=> $product['categoria_id'],
                'nome'        => $product['nome'],
                'preco'       => $product['preco'],
                'estoque'     => $product['estoque'],
                'descricao'   => $product['descricao'],
                'foto_url'    => $product['foto_url'],
                'status'      => $product['status'],
            ];
        } catch(PDOException $e) {
            if(str_contains($e->getMessage(), 'ERRO_INSERT_PRODUCT') || $e->getCode() == 23000) {
                throw new RuntimeException("PRODUTO_JA_EXISTE", 0, $e);
            }

            throw new RuntimeException('ERRO_INSERT_PRODUCT', 0, $e);
        }

    }
}
