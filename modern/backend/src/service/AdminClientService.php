<?php

require_once __DIR__ . '/../repository/AdminClientRepository.php';

class AdminClientService {
    private AdminClientRepository $repository;

    public function __construct() {
        $this->repository = new AdminClientRepository();
    }
    public function getAllClients() {
        return $this->repository->getAllClients();
    }

    public function deleteClient($id) {
        $this->repository->deleteClient($id);

        return ['message' => 'Cliente removido com sucesso'];
    }

}
