<?php

require_once __DIR__ . '/../core/connection.php';

class AdminUsersRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function createUser(array $user): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Usuario (papel_id, is_admin, nome, email, senha)
                VALUES (?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $user['papel_id'],
                $user['is_admin'],
                $user['nome'],
                $user['email'],
                $user['senha'],
            ]);

            return ['id' => (int)$this->db->lastInsertId()] + $user;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('EMAIL_JA_EXISTE', 0, $e);
            }
            throw new RuntimeException('ERRO_INSERT_USUARIO: ' . $e->getMessage(), 0, $e);
        }
    }
}
