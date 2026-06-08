<?php

require_once __DIR__ . '/../repository/AdminClientRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';

class AdminClientService {
    private AdminClientRepository $repository;

    public function __construct(?AdminClientRepository $repo = null) {
        $this->repository = $repo ?? new AdminClientRepository();
    }
    public function getAllClients() {
        return $this->repository->getAllClients();
    }

    public function deleteClient($id, ?array $admin = null) {
        $this->repository->deleteClient($id);

        if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'cliente', (int)$id);
        return ['message' => 'Cliente removido com sucesso'];
    }

}
