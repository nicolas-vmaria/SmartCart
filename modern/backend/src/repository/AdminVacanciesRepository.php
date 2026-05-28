<?php

require_once __DIR__ . '/../core/connection.php';

class AdminVacanciesRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getAll(): array {
        try {
            $stmt = $this->db->query('SELECT * FROM Trabalho ORDER BY id DESC');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_VAGAS: ' . $e->getMessage(), 0, $e);
        }
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM Trabalho WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function findByNome(string $nome, ?int $excludeId = null): ?array {
        if ($excludeId !== null) {
            $stmt = $this->db->prepare('SELECT id FROM Trabalho WHERE nome = ? AND id != ?');
            $stmt->execute([$nome, $excludeId]);
        } else {
            $stmt = $this->db->prepare('SELECT id FROM Trabalho WHERE nome = ?');
            $stmt->execute([$nome]);
        }
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function hasApplications(int $id): bool {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM Aplicacao WHERE trabalho_id = ?');
        $stmt->execute([$id]);
        return (int)$stmt->fetchColumn() > 0;
    }

    public function create(array $data): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Trabalho (nome, slug, cargo, area, tipo_contrato, formato_trabalho, local, requisitos, ativa)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $data['nome'],
                $data['slug'],
                $data['cargo'],
                $data['area'],
                $data['tipo_contrato'],
                $data['formato_trabalho'],
                $data['local'],
                $data['requisitos'],
                (int)$data['ativa'],
            ]);

            $id = (int)$this->db->lastInsertId();
            return $this->findById($id) ?? ['id' => $id];
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_INSERT_VAGA: ' . $e->getMessage(), 0, $e);
        }
    }

    public function update(int $id, array $data): void {
        try {
            $stmt = $this->db->prepare('
                UPDATE Trabalho
                SET nome = ?, slug = ?, cargo = ?, area = ?, tipo_contrato = ?, formato_trabalho = ?, local = ?, requisitos = ?, ativa = ?
                WHERE id = ?
            ');
            $stmt->execute([
                $data['nome'],
                $data['slug'],
                $data['cargo'],
                $data['area'],
                $data['tipo_contrato'],
                $data['formato_trabalho'],
                $data['local'],
                $data['requisitos'],
                (int)$data['ativa'],
                $id,
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_VAGA: ' . $e->getMessage(), 0, $e);
        }
    }

    public function delete(int $id): void {
        try {
            $stmt = $this->db->prepare('DELETE FROM Trabalho WHERE id = ?');
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_DELETE_VAGA: ' . $e->getMessage(), 0, $e);
        }
    }
}