<?php

require_once __DIR__ . '/../core/connection.php';

class AdminUsersRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        $stmt = $this->db->query('
            SELECT u.id, u.nome, u.email, u.papel_id, u.created_at, p.nome_papel, p.badge
            FROM Usuario u
            JOIN Papeis p ON p.id = u.papel_id
            WHERE u.papel_id != 1
            ORDER BY u.created_at DESC
        ');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createUser(array $user): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Usuario (papel_id, is_admin, nome, email, senha)
                VALUES (?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $user['papel_id'],
                1,
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

    public function updateUser(int $id, array $data): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Usuario SET nome = ?, email = ?, papel_id = ? WHERE id = ?
            ');
            $stmt->execute([$data['nome'], $data['email'], $data['papel_id'], $id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('EMAIL_JA_EXISTE', 0, $e);
            }
            throw new RuntimeException('ERRO_UPDATE_USUARIO: ' . $e->getMessage(), 0, $e);
        }
    }

    public function deleteUser(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM Usuario WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function resetPassword(int $id, string $hash): bool {
        $stmt = $this->db->prepare('UPDATE Usuario SET senha = ? WHERE id = ?');
        $stmt->execute([$hash, $id]);
        return $stmt->rowCount() > 0;
    }
}
