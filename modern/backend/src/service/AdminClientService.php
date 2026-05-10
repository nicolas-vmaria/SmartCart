<?php

class AdminClientService {
    public function getAllClients() {
        return ['message' => 'Listando todos os clientes'];
    }

    public function createClient() {
        return ['message' => 'Cliente criado com sucesso'];
    }

    public function updateClient($id) {
        return ['message' => "Cliente $id atualizado"];
    }

    public function deleteClient($id) {
        return ['message' => "Cliente $id removido"];
    }
}
