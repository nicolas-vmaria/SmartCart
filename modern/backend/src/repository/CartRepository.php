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

    public function addItem(int $carrinho_id, int $produto_id, int $quantidade): void {
        try {
            $produto = $this->findProdutoById($produto_id);
        if (!$produto) {
            throw new InvalidArgumentException("Produto não encontrado");
        }

        $stmtCheck = $this->db->prepare(
            "SELECT id, quantidade FROM Itens_Carrinho WHERE carrinho_id = ? AND produto_id = ?"
        );
        $stmtCheck->execute([$carrinho_id, $produto['id']]);
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
}