<?php

require_once __DIR__ . '/../repository/AdminAuditRepository.php';

class AdminAuditService {
    private AdminAuditRepository $repository;

    public function __construct(?AdminAuditRepository $repo = null) {
        $this->repository = $repo ?? new AdminAuditRepository();
    }

    public function getLogs(array $query): array {
        try {
            $filters = [];
            if (!empty($query['entidade']))    $filters['entidade']    = $query['entidade'];
            if (!empty($query['admin_id']))    $filters['admin_id']    = $query['admin_id'];
            if (!empty($query['papel_id']))    $filters['papel_id']    = $query['papel_id'];
            if (!empty($query['data_inicio'])) $filters['data_inicio'] = $query['data_inicio'];
            if (!empty($query['data_fim']))    $filters['data_fim']    = $query['data_fim'];

            return [
                'logs'   => $this->repository->getLogs($filters),
                'admins' => $this->repository->getAdmins(),
                'roles'  => $this->repository->getRoles(),
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar logs de auditoria'];
        }
    }
}
