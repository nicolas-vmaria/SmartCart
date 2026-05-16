<?php

require_once __DIR__ . '/../core/connection.php';

class AdminProductRepository {
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function getAllProducts(): array {
        try {
            $stmt = $this->db->query('
                SELECT p.*, c.nome AS categoria, c.slug AS categoria_slug
                FROM Produtos p
                LEFT JOIN Categorias c ON p.categoria_id = c.id
            ');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_PRODUTOS', 0, $e);
        }
    }

    public function createProduct(array $product): array {
        try {
            $status = (int)$product['status'];

            $stmt = $this->db->prepare('
                INSERT INTO Produtos (categoria_id, nome, slug, preco, estoque, descricao, foto_url, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $product['categoria_id'],
                $product['nome'],
                $product['slug'],
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

            if ($e->getCode() == 23000 && (str_contains($e->getMessage(), 'a foreign key constraint fails'))) {
                throw new InvalidArgumentException("A categoria_id informada nao existe.");
            }
            
            if ($e->getCode() == 23000 && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("PRODUTO_JA_EXISTE", 0, $e);
            }
    

            throw new RuntimeException('ERRO_INSERT_PRODUCT: ' . $e->getMessage(), 0, $e);
        }
    }

}

