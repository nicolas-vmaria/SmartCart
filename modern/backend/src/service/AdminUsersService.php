<?php

require_once __DIR__ . '/../repository/AdminUsersRepository.php';

class AdminUsersService {
    private AdminUsersRepository $repository;

    public function __construct() {
        $this->repository = new AdminUsersRepository();
    }

    public function getAllUsers(): array {
        try {
            return ['users' => $this->repository->findAll()];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar usuários: ' . $e->getMessage()];
        }
    }

    public function createUser(array $body): array {
        $nome     = trim($body['nome'] ?? '');
        $email    = trim($body['email'] ?? '');
        $papel_id = (int)($body['papel_id'] ?? 0);

        if (!$nome || !$email || !$papel_id) {
            http_response_code(400);
            return ['error' => 'Campos obrigatórios ausentes: nome, email, papel_id'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Email inválido'];
        }

        try {
            $senha = password_hash('Smartcart$123', PASSWORD_BCRYPT);
            $user  = $this->repository->createUser([
                'nome'     => $nome,
                'email'    => $email,
                'papel_id' => $papel_id,
                'senha'    => $senha,
            ]);

            http_response_code(201);
            return ['message' => "Usuário '{$nome}' criado com sucesso", 'user' => $user];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_JA_EXISTE') {
                http_response_code(409);
                return ['error' => 'Já existe um usuário com esse email'];
            }
            http_response_code(500);
            return ['error' => 'Erro interno ao criar usuário: ' . $e->getMessage()];
        }
    }

    public function updateUser(int $id, array $body): array {
        $nome     = trim($body['nome'] ?? '');
        $email    = trim($body['email'] ?? '');
        $papel_id = (int)($body['papel_id'] ?? 0);

        if (!$nome || !$email || !$papel_id) {
            http_response_code(400);
            return ['error' => 'Campos obrigatórios ausentes: nome, email, papel_id'];
        }

        try {
            $updated = $this->repository->updateUser($id, compact('nome', 'email', 'papel_id'));

            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            return ['message' => 'Usuário atualizado com sucesso'];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_JA_EXISTE') {
                http_response_code(409);
                return ['error' => 'Já existe um usuário com esse email'];
            }
            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar usuário: ' . $e->getMessage()];
        }
    }

    public function deleteUser(int $id): array {
        try {
            $deleted = $this->repository->deleteUser($id);

            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            return ['message' => "Usuário $id removido com sucesso"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover usuário: ' . $e->getMessage()];
        }
    }

    public function resetPassword(int $id): array {
        try {
            $hash    = password_hash('admin@1234', PASSWORD_BCRYPT);
            $updated = $this->repository->resetPassword($id, $hash);

            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            return ['message' => 'Senha redefinida com sucesso'];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao redefinir senha: ' . $e->getMessage()];
        }
    }
}
