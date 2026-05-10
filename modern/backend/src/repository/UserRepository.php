<?php

require_once __DIR__ . '/../core/connection.php';

class UserRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('
            SELECT u.id, u.nome, u.email, u.senha, r.nome AS role
            FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.email = ?
        ');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }
}
