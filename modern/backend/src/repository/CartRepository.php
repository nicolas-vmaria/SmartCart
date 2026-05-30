<?php

require_once __DIR__ . '/../core/connection.php';

class CartRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findProdutoById(int $id): array|false {
        $stmt = $this->db->prepare('SELECT id, nome, preco, estoque, status FROM Produtos WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findItemById(int $id): array|false {
        $stmt = $this->db->prepare('SELECT id, produto_id, quantidade FROM Itens_Carrinho WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    public function createCarrinho(int $usuario_id): int {
        $stmt = $this->db->prepare('INSERT INTO Carrinhos (usuario_id, status) VALUES (?, "ativo")');
        $stmt->execute([$usuario_id]);
        return (int)$this->db->lastInsertId();
    }

    public function findCarrinhoAtivo(int $usuario_id): array|false {
        $stmt = $this->db->prepare(
            "SELECT id FROM Carrinhos WHERE usuario_id = ? AND status = 'ativo' LIMIT 1"
        );
        $stmt->execute([$usuario_id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCart(int $usuario_id): array|false {
        try {
        $stmt = $this->db->prepare('
            SELECT
                ic.id AS item_id,
                c.id AS carrinho_id,
                c.status,
                p.id AS produto_id,
                p.nome AS produto_nome,
                p.preco,
                p.foto_url,
                p.estoque,
                ic.quantidade,
                (p.preco * ic.quantidade) AS subtotal
            FROM Carrinhos c
            JOIN Itens_Carrinho ic ON ic.carrinho_id = c.id
            JOIN Produtos p ON p.id = ic.produto_id
            WHERE c.usuario_id = ? AND c.status = "ativo"
        ');
        $stmt->execute([$usuario_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        throw new RuntimeException('ERRO_GET_CARRINHO', 0, $e);
    }
    }

    public function addItem(int $carrinho_id, int $produto_id, int $quantidade): void {
        try {
            $produto = $this->findProdutoById($produto_id);
        if (!$produto) {
            throw new InvalidArgumentException("Produto não encontrado, verifique o ID");
        }

        $stmtCheck = $this->db->prepare(
            "SELECT id, quantidade FROM Itens_Carrinho WHERE carrinho_id = ? AND produto_id = ?"
        );
        $stmtCheck->execute([$carrinho_id, $produto_id]);
        $itemExistente = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($itemExistente) {
            $novaQuantidade = $itemExistente['quantidade'] + $quantidade;
            $stmtUpdate = $this->db->prepare(
                "UPDATE Itens_Carrinho SET quantidade = ? WHERE id = ?"
            );
            $stmtUpdate->execute([$novaQuantidade, $itemExistente['id']]);
        } else {
            $stmtInsert = $this->db->prepare(
                "INSERT INTO Itens_Carrinho (carrinho_id, produto_id, quantidade) VALUES (?, ?, ?)"
            );
            $stmtInsert->execute([$carrinho_id, $produto['id'], $quantidade]);
         }
        } catch (Exception $e) {
            if ($e instanceof InvalidArgumentException) {
                throw $e;
            }
            throw new RuntimeException("Não foi possível adicionar o item ao carrinho");
        
        }
  }

    public function updateItem(int $item_id, int $quantidade): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Itens_Carrinho ic
                JOIN Produtos p ON p.id = ic.produto_id
                SET ic.quantidade = ?
                WHERE ic.id = ? AND p.estoque >= ? AND p.status = 1
            ');
            $stmt->execute([$quantidade, $item_id, $quantidade]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_ITEM', 0, $e);
        }
    }

    public function removeItem(int $item_id): bool {
        try {
            $stmt = $this->db->prepare(
                "DELETE FROM Itens_Carrinho WHERE id = ?"
            );
            $stmt->execute([$item_id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_REMOVE_ITEM', 0, $e);
        }
    }

    public function clearCart(int $usuario_id): bool {
        try {
            $stmt = $this->db->prepare('
                DELETE ic FROM Itens_Carrinho ic 
                JOIN Carrinhos c ON c.id = ic.carrinho_id
                WHERE c.usuario_id = ? AND c.status = "ativo"
                ');
            $stmt->execute([$usuario_id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_CLEAR_CART', 0, $e);
        }
    }
}