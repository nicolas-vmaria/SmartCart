<?php

require_once __DIR__ . '/../core/connection.php';

class AdminBannerRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        $stmt = $this->db->query('SELECT * FROM Banners ORDER BY ordem ASC, criado_em ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findActive(): array {
        $stmt = $this->db->query('SELECT * FROM Banners WHERE ativo = TRUE ORDER BY ordem ASC, criado_em ASC');
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(string $foto_url): array {
        $maxOrdem = (int)$this->db->query('SELECT COALESCE(MAX(ordem), -1) + 1 FROM Banners')->fetchColumn();
        $stmt = $this->db->prepare('INSERT INTO Banners (foto_url, ordem) VALUES (?, ?)');
        $stmt->execute([$foto_url, $maxOrdem]);
        $id = (int)$this->db->lastInsertId();
        return ['id' => $id, 'foto_url' => $foto_url, 'ordem' => $maxOrdem, 'ativo' => true];
    }

    public function getFotoUrl(int $id): ?string {
        $stmt = $this->db->prepare('SELECT foto_url FROM Banners WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['foto_url'] : null;
    }

    public function delete(int $id): bool {
        $stmt = $this->db->prepare('DELETE FROM Banners WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->rowCount() > 0;
    }

    public function reorder(array $ids): void {
        $stmt = $this->db->prepare('UPDATE Banners SET ordem = ? WHERE id = ?');
        foreach ($ids as $ordem => $id) {
            $stmt->execute([$ordem, (int)$id]);
        }
    }

    public function toggleAtivo(int $id): ?array {
        $stmt = $this->db->prepare('UPDATE Banners SET ativo = NOT ativo WHERE id = ?');
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) return null;
        $stmt = $this->db->prepare('SELECT * FROM Banners WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    }
}
