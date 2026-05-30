<?php

require_once __DIR__ . '/../core/connection.php';

class AdminCategoryRepository {
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function getAllCategories(): array{
        try{
            $stmt = $this->db->prepare('
                SELECT c.*,
                    (SELECT COUNT(*) FROM Produtos p WHERE p.categoria_id = c.id) AS total_produtos
                FROM Categorias c
                ORDER BY c.nome ASC
            ');
            $stmt->execute();

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e){
            throw new RuntimeException('ERRO_GET_CATEGORIES', 0, $e);
        }
    }

    public function insertCategory(array $category): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Categorias (nome, slug, descricao)
                VALUES (?, ?, ?)
            ');

            $stmt->execute([
                $category['nome'],
                $category['slug'],
                $category['descricao']
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id' => $id,
                'nome' => $category['nome'],
                'descricao' => $category['descricao']
            ];
        } catch(Exception $e) {
            $msg = $e->getMessage();

            if ($e->getCode() === '23000') {
                throw new RuntimeException('CATEGORIA_JA_EXISTE', 0, $e);
            }
            throw new RuntimeException('ERRO_INSERT_CATEGORY', 0, $e);
        }

    }

    public function deleteCategory(int $id): bool{
        try{
            $this->db->beginTransaction();

            $this->db->prepare('
                DELETE FROM Itens_Carrinho WHERE produto_id IN (SELECT id FROM Produtos WHERE categoria_id = ?)
            ')->execute([$id]);

            $this->db->prepare('
                DELETE FROM Produtos WHERE categoria_id = ?
            ')->execute([$id]);

            $stmt = $this->db->prepare('DELETE FROM Categorias WHERE id = ?');
            $stmt->execute([$id]);

            $this->db->commit();

            return $stmt->rowCount() > 0;
        }catch(Exception $e){
            $this->db->rollBack();
            throw new RuntimeException('ERRO_DELETE_CATEGORY', 0, $e);
        }
    }

    public function updateCategory(int $id, array $data): bool {
    try {
        $stmt = $this->db->prepare('
            UPDATE Categorias SET nome = ?, slug = ?, descricao = ? WHERE id = ?');

        $stmt->execute([
            $data['nome'],
            $data['slug'],
            $data['descricao'],
            $id
        ]);

        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        if ($e->getCode() === '23000') {
            throw new RuntimeException('CATEGORIA_JA_EXISTE', 0, $e);
        }
        throw new RuntimeException('ERRO_UPDATE_CATEGORY', 0, $e);
    }
}
}

