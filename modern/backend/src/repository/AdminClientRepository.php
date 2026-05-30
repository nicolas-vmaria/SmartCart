<?php

require_once __DIR__ . '/../core/Connection.php';

class AdminClientRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getAllClients() {
        $stmt = $this->db->prepare('SELECT * FROM Usuario WHERE papel_id = 1');
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function deleteClient(int $id) {
        $stmt = $this->db->prepare('DELETE FROM Usuario WHERE id = :id');
        $stmt->bindParam(':id', $id);
        $stmt->execute();
    }
}