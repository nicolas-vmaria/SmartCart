<?php

require_once __DIR__ . '/../core/connection.php';

class AdminProfileRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('
            SELECT u.id, u.nome, u.email, u.tel, p.nome_papel, u.created_at
            FROM Usuario u
            JOIN Papeis p ON p.id = u.papel_id
            WHERE u.id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('SELECT id FROM Usuario WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function findByIdWithSenha(int $id): ?array {
        $stmt = $this->db->prepare('SELECT id, senha FROM Usuario WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }

    public function updateProfile(int $id, array $data): void {
        $stmt = $this->db->prepare('UPDATE Usuario SET nome = ?, email = ?, tel = ? WHERE id = ?');
        $stmt->execute([$data['nome'], $data['email'], $data['tel'], $id]);
    }

    public function updatePassword(int $id, string $hash): void {
        $stmt = $this->db->prepare('UPDATE Usuario SET senha = ? WHERE id = ?');
        $stmt->execute([$hash, $id]);
    }
}
