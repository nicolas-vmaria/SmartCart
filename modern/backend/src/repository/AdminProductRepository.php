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
                INSERT INTO Produtos (categoria_id, nome, slug, preco, estoque, descricao, foto_url, status, desconto_percentual)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                $product['desconto_percentual'],
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

            if ($e->getCode() === '23000' && (str_contains($e->getMessage(), 'a foreign key constraint fails'))) {
                throw new InvalidArgumentException("A categoria_id informada nao existe.");
            }
            
            if ($e->getCode() === '23000' && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("PRODUTO_JA_EXISTE", 0, $e);
            }
    

            throw new RuntimeException('ERRO_INSERT_PRODUCT: ' . $e->getMessage(), 0, $e);
        }
    }

    public function updateProduct(int $id, array $product): bool {
        try {
            $stmt = $this->db->prepare('
            UPDATE Produtos SET categoria_id = ?, nome = ?, slug = ?, preco = ?, estoque = ?, descricao = ?, foto_url = ?, status = ?, desconto_percentual = ?
            WHERE id = ?
            ');

            $stmt->execute([
                $product['categoria_id'],
                $product['nome'],
                $product['slug'],
                $product['preco'],
                $product['estoque'],
                $product['descricao'],
                $product['foto_url'],
                $product['status'],
                $product['desconto_percentual'],
                $id,
            ]);

            return $stmt->rowCount() > 0;
        } catch(PDOException $e) {
            if($e->getCode() == '23000' && (str_contains($e->getMessage(), 'a foreign key constraint fails'))) {
                throw new InvalidArgumentException("A categoria_id informada nao existe.");
            }

            if($e->getCode() == '23000' && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("PRODUTO_JA_EXISTE", 0, $e);
            }

            throw new RuntimeException('ERRO_UPDATE_PRODUCT: ' . $e->getMessage(), 0, $e);
            }
        }

        public function deleteProduct(int $id): bool {
            try {
                $this->db->beginTransaction();

                $this->db->prepare('
                    DELETE FROM Review WHERE produto_id = ?
                ')->execute([$id]);

                $this->db->prepare('
                    DELETE FROM Itens_Carrinho WHERE produto_id = ?
                ')->execute([$id]);

                $this->db->prepare('
                    DELETE FROM Itens_Pedido WHERE produto_id = ?
                ')->execute([$id]);

                $stmt = $this->db->prepare('
                    DELETE FROM Produtos WHERE id = ?
                ');
                $stmt->execute([$id]);

                $this->db->commit();
                
                
                return $stmt->rowCount() > 0;
            } catch(PDOException $e) {
                $this->db->rollBack();
                throw new RuntimeException('ERRO_DELETE_PRODUCT: ' . $e->getMessage(), 0, $e);
            }
        }
    }
            


