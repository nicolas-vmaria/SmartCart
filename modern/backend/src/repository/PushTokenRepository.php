<?php

require_once __DIR__ . '/../../config/Database.php';

class PushTokenRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
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
