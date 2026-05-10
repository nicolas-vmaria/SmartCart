<?php

class AdminUserService {
    public function getAllUsers() {
        return ['message' => 'Listando todos os usuários (admin)'];
    }

    public function updateUserRole($id) {
        return ['message' => "Role do usuário $id atualizada"];
    }

    public function deleteUser($id) {
        return ['message' => "Usuário $id removido"];
    }

    public function getAllRoles() {
        return ['message' => 'Listando todos os papéis'];
    }

    public function createRole() {
        return ['message' => 'Papel criado com sucesso'];
    }

    public function deleteRole($id) {
        return ['message' => "Papel $id removido"];
    }
}
