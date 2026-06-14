<?php

require_once __DIR__ . '/../core/connection.php';

class PushTokenRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function save(string $token): void {
        $stmt = $this->db->prepare(
            'INSERT INTO PushTokens (token) VALUES (:token)
             ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP'
        );
        $stmt->execute([':token' => $token]);
    }

    public function findAll(): array {
        return $this->db->query('SELECT token FROM PushTokens')
            ->fetchAll(PDO::FETCH_COLUMN);
    }
}
