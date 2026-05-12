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
}