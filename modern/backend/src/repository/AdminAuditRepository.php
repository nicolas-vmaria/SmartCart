<?php

require_once __DIR__ . '/../core/connection.php';

class AdminAuditRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getLogs(array $filters = []): array {
        $where  = [];
        $params = [];
        $join   = '';

        if (!empty($filters['papel_id'])) {
            $join     = ' INNER JOIN Usuario u ON al.admin_id = u.id';
            $where[]  = 'u.papel_id = ?';
            $params[] = (int) $filters['papel_id'];
        }

        if (!empty($filters['entidade'])) {
            $where[]  = 'al.entidade = ?';
            $params[] = $filters['entidade'];
        }

        if (!empty($filters['admin_id'])) {
            $where[]  = 'al.admin_id = ?';
            $params[] = (int) $filters['admin_id'];
        }

        if (!empty($filters['data_inicio'])) {
            $where[]  = 'DATE(al.created_at) >= ?';
            $params[] = $filters['data_inicio'];
        }

        if (!empty($filters['data_fim'])) {
            $where[]  = 'DATE(al.created_at) <= ?';
            $params[] = $filters['data_fim'];
        }

        $sql = 'SELECT al.id, al.admin_id, al.admin_nome, al.acao, al.entidade, al.entidade_id, al.detalhes, al.created_at FROM AuditLog al' . $join;
        if ($where) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY al.created_at DESC LIMIT 500';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAdmins(): array {
        $stmt = $this->db->query(
            'SELECT DISTINCT admin_id, admin_nome FROM AuditLog ORDER BY admin_nome'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getRoles(): array {
        $stmt = $this->db->query(
            'SELECT id, nome_papel FROM Papeis WHERE id != 1 ORDER BY nome_papel'
        );
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
