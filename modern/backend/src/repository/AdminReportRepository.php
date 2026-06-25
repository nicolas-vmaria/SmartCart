<?php

require_once __DIR__ . '/../core/connection.php';

class AdminReportRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function create(array $report): array {
        $stmt = $this->db->prepare('
            INSERT INTO AdminReports (
                admin_id, admin_nome, admin_email, problema_central, categoria,
                prioridade, contexto_afetado, titulo, descricao, passos, navegador
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');

        $stmt->execute([
            $report['admin_id'],
            $report['admin_nome'],
            $report['admin_email'],
            $report['problema_central'],
            $report['categoria'],
            $report['prioridade'],
            $report['contexto_afetado'],
            $report['titulo'],
            $report['descricao'],
            $report['passos'],
            $report['navegador'],
        ]);

        $id = (int)$this->db->lastInsertId();
        return $this->findById($id) ?? ['id' => $id, ...$report, 'status' => 'novo'];
    }

    public function markSent(int $id): void {
        $stmt = $this->db->prepare('
            UPDATE AdminReports
            SET status = ?, erro_envio = NULL
            WHERE id = ?
        ');
        $stmt->execute(['enviado', $id]);
    }

    public function markError(int $id, string $error): void {
        $stmt = $this->db->prepare('
            UPDATE AdminReports
            SET status = ?, erro_envio = ?
            WHERE id = ?
        ');
        $stmt->execute(['erro', substr($error, 0, 500), $id]);
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM AdminReports WHERE id = ?');
        $stmt->execute([$id]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);
        return $report ?: null;
    }
}
