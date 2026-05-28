<?php

require_once __DIR__ . '/../core/connection.php';

class CandidacyRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getAllActive(): array {
        try {
            $stmt = $this->db->query('SELECT * FROM Trabalho WHERE ativa = TRUE ORDER BY id DESC');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_VAGAS: ' . $e->getMessage(), 0, $e);
        }
    }

    public function findBySlug(string $slug): ?array {
        try {
            $stmt = $this->db->prepare('SELECT * FROM Trabalho WHERE slug = ? AND ativa = TRUE');
            $stmt->execute([$slug]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_VAGA: ' . $e->getMessage(), 0, $e);
        }
    }

    public function findById(int $id): ?array {
        try {
            $stmt = $this->db->prepare('SELECT * FROM Trabalho WHERE id = ?');
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_VAGA: ' . $e->getMessage(), 0, $e);
        }
    }

    public function createApplication(array $data): void {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Aplicacao (trabalho_id, nome, email, tel, portfolio_url, curriculo_url, carta_apresent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $data['trabalho_id'],
                $data['nome'],
                $data['email'],
                $data['tel'],
                $data['portfolio_url'],
                $data['curriculo_url'],
                $data['carta_apresent'],
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_INSERIR_APLICACAO: ' . $e->getMessage(), 0, $e);
        }
    }

    public function createEspontanea(array $data): void {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Aplicacao (trabalho_id, area_interesse, nome, email, tel, portfolio_url, curriculo_url, carta_apresent)
                VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $data['area_interesse'],
                $data['nome'],
                $data['email'],
                $data['tel'],
                $data['portfolio_url'],
                $data['curriculo_url'],
                $data['carta_apresent'],
            ]);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_INSERIR_ESPONTANEA: ' . $e->getMessage(), 0, $e);
        }
    }
}