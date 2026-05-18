<?php

require_once __DIR__ . '/../core/connection.php';

class AdminEmployeesRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findByEmail(string $email): array|false {
        $stmt = $this->db->prepare('SELECT id FROM Usuario WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function getAll(): array {
    $stmt = $this->db->query('
        SELECT u.id, u.nome, u.email, u.is_admin,
               p.nome_papel, u.created_at
        FROM Usuario u
        INNER JOIN Papeis p ON p.id = u.papel_id where is_admin = 1;

    ');
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

    public function create(array $data): int {
        $stmt = $this->db->prepare('
            INSERT INTO Usuario (nome, email, senha, papel_id, is_admin)
            VALUES (:nome, :email, :senha, :papel_id, :is_admin)
        ');

        $stmt->execute([
            ':nome'     => $data['nome'],
            ':email'    => $data['email'],
            ':senha'    => $data['senha_hash'],
            ':papel_id' => $data['papel_id'],
            ':is_admin' => true,
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
    $stmt = $this->db->prepare('
        UPDATE Usuario
        SET nome     = :nome,
            email    = :email,
            papel_id = :papel_id
        WHERE id = :id
    ');

    $stmt->execute([
        ':nome'     => $data['nome'],
        ':email'    => $data['email'],
        ':papel_id' => $data['papel_id'],
        ':id'       => $id,
    ]);

    return $stmt->rowCount() > 0;
    }

    public function delete(int $id): bool {
    $stmt = $this->db->prepare('
        DELETE FROM Usuario
        WHERE id = :id
    ');

    $stmt->execute([':id' => $id]);

    return $stmt->rowCount() > 0;
    }

    public function resetPassword(int $id, string $senhaHash): bool {
    $stmt = $this->db->prepare('
        UPDATE Usuario
        SET senha = :senha
        WHERE id = :id
    ');

    $stmt->execute([
        ':senha' => $senhaHash,
        ':id'    => $id,
    ]);

    return $stmt->rowCount() > 0;
    }

    public function findById(int $id): array|false {
        $stmt = $this->db->prepare('
            SELECT u.id, u.nome, u.email, u.is_admin,
                   p.nome_papel, u.created_at
            FROM Usuario u
            INNER JOIN Papeis p ON p.id = u.papel_id
            WHERE u.id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getAllRoles(): array {
        $stmt = $this->db->query('SELECT id, nome_papel FROM Papeis ORDER BY id');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}