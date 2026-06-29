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

    public function findAll(array $filters = []): array {
        $where = [];
        $params = [];

        if (!empty($filters['status'])) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['prioridade'])) {
            $where[] = 'prioridade = ?';
            $params[] = $filters['prioridade'];
        }

        if (!empty($filters['problema_central'])) {
            $where[] = 'problema_central = ?';
            $params[] = $filters['problema_central'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(titulo LIKE ? OR descricao LIKE ? OR admin_nome LIKE ? OR categoria LIKE ? OR contexto_afetado LIKE ?)';
            $term = '%' . $filters['search'] . '%';
            array_push($params, $term, $term, $term, $term, $term);
        }

        $sql = 'SELECT * FROM AdminReports';
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= " ORDER BY FIELD(status, 'erro', 'enviado', 'novo', 'em_atendimento', 'resolvido', 'fechado'), FIELD(prioridade, 'Critica', 'Alta', 'Media', 'Baixa'), created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getStats(): array {
        $stmt = $this->db->query("
            SELECT
                COUNT(*) AS total,
                SUM(status IN ('novo', 'enviado', 'erro')) AS abertos,
                SUM(status = 'em_atendimento') AS em_atendimento,
                SUM(status IN ('resolvido', 'fechado')) AS resolvidos,
                SUM(prioridade = 'Critica' AND status NOT IN ('resolvido', 'fechado')) AS criticos
            FROM AdminReports
        ");
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [
            'total' => 0,
            'abertos' => 0,
            'em_atendimento' => 0,
            'resolvidos' => 0,
            'criticos' => 0,
        ];
    }

    public function updateAttendance(int $id, array $data): ?array {
        $stmt = $this->db->prepare('
            UPDATE AdminReports
            SET status = ?,
                tecnico_id = ?,
                tecnico_nome = ?,
                resolucao = ?,
                resolvido_at = ?,
                erro_envio = CASE WHEN ? <> ? THEN NULL ELSE erro_envio END
            WHERE id = ?
        ');

        $stmt->execute([
            $data['status'],
            $data['tecnico_id'],
            $data['tecnico_nome'],
            $data['resolucao'],
            $data['resolvido_at'],
            $data['status'],
            'erro',
            $id,
        ]);

        return $this->findById($id);
    }

    public function findById(int $id): ?array {
        $stmt = $this->db->prepare('SELECT * FROM AdminReports WHERE id = ?');
        $stmt->execute([$id]);
        $report = $stmt->fetch(PDO::FETCH_ASSOC);
        return $report ?: null;
    }
}
