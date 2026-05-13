<?php

require_once __DIR__ . '/../core/connection.php';

class UserRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('
            SELECT u.id, u.nome, u.email, u.senha, p.nome_papel AS role
            FROM Usuario u
            JOIN Papeis p ON p.id = u.papel_id
            WHERE u.email = ?
        ');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function register(array $user): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Usuario (papel_id, is_admin, nome, email, senha)
                VALUES (?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                1,
                false,
                $user['nome'],
                $user['email'],
                $user['senha'],
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id' => $id,
                'nome' => $user['nome'],
                'email' => $user['email'],
            ];
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('EMAIL_ALREADY_EXISTS', 0, $e);
            }
            throw $e;
        }
    }
}
