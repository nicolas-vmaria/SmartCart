<?php

require_once __DIR__ . '/../repository/AdminUsersRepository.php';

class AdminUsersService {
    private AdminUsersRepository $repository;

    public function __construct() {
        $this->repository = new AdminUsersRepository();
    }

    public function getAllUsers(): array {
        return ['message' => 'Listando todos os usuários (admin)'];
    }

    public function createUser(array $body): array {
        $nome     = isset($body['nome'])     ? trim((string)$body['nome'])  : '';
        $email    = isset($body['email'])    ? trim((string)$body['email']) : '';
        $senha    = isset($body['senha'])    ? (string)$body['senha']       : '';
        $papel_id = isset($body['papel_id']) ? (int)$body['papel_id']       : 0;
        $is_admin = !empty($body['is_admin']);

        if (!$nome || !$email || !$senha || !$papel_id) {
            http_response_code(400);
            return ['error' => 'nome, email, senha e papel_id são obrigatórios'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido'];
        }

        if (strlen($senha) < 8) {
            http_response_code(400);
            return ['error' => 'A senha deve ter pelo menos 8 caracteres'];
        }

        try {
            $user = $this->repository->createUser([
                'nome'     => $nome,
                'email'    => $email,
                'senha'    => password_hash($senha, PASSWORD_DEFAULT),
                'papel_id' => $papel_id,
                'is_admin' => $is_admin,
            ]);
            return ['message' => 'Usuário criado com sucesso', 'user' => $user];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_JA_EXISTE') {
                http_response_code(409);
                return ['error' => 'Já existe um usuário com esse e-mail'];
            }
            http_response_code(500);
            return ['error' => 'Erro interno ao criar usuário'];
        }
    }

    public function updateUserRole(string $id, array $body): array {
        return ['message' => "Papel do usuário $id atualizado"];
    }

    public function deleteUser(string $id): array {
        return ['message' => "Usuário $id removido"];
    }
}
