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
                select * from Categorias order by nome asc
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
            $stmt = $this->db->prepare('
                delete from Categorias where id = ?
            ');
            $stmt->execute([$id]);

            return $stmt->rowCount() > 0;
        }catch(Exception $e){
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

