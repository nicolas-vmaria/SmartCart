<?php

require_once __DIR__ . '/../core/connection.php';

class AdminCategoryRepository {
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function insertCategory(array $category): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Categoria (nome, slug, descricao)
                VALUES (?, ?, ?)
            ');

            $stmt->execute([
                $category['nome'],
                $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $category['nome'])),
                $category['descricao']
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id' => $id,
                'nome' => $category['nome'],
                'descricao' => $category['descricao']
            ];
        } catch(Exception $e) {
            throw new RuntimeException('ERRO_INSERT_CATEGORY', 0, $e);
        }

    }
}
