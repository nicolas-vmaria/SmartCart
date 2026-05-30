<?php

require_once __DIR__ . '/../repository/AdminProfileRepository.php';

class AdminProfileService {
    private AdminProfileRepository $repository;

    public function __construct() {
        $this->repository = new AdminProfileRepository();
    }

    public function getProfile(int $id): array {
        $user = $this->repository->findById($id);
        if (!$user) {
            http_response_code(404);
            return ['error' => 'Usuário não encontrado'];
        }
        return ['profile' => $user];
    }

    public function updateProfile(int $id, array $body): array {
        $nome  = trim($body['nome']  ?? '');
        $email = trim($body['email'] ?? '');
        $tel   = trim($body['tel']   ?? '');

        if (!$nome || !$email) {
            http_response_code(400);
            return ['error' => 'Nome e email são obrigatórios'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'Email inválido'];
        }

        $existing = $this->repository->findByEmail($email);
        if ($existing && (int)$existing['id'] !== $id) {
            http_response_code(409);
            return ['error' => 'Email já está em uso'];
        }

        $this->repository->updateProfile($id, ['nome' => $nome, 'email' => $email, 'tel' => $tel ?: null]);
        return ['message' => 'Perfil atualizado com sucesso', 'profile' => $this->repository->findById($id)];
    }

    public function changePassword(int $id, array $body): array {
        $senhaAtual    = $body['senha_atual']    ?? '';
        $senhaNova     = $body['senha_nova']     ?? '';
        $senhaConfirma = $body['senha_confirma'] ?? '';

        if (!$senhaAtual || !$senhaNova || !$senhaConfirma) {
            http_response_code(400);
            return ['error' => 'Todos os campos de senha são obrigatórios'];
        }

        if (strlen($senhaNova) < 8) {
            http_response_code(400);
            return ['error' => 'A nova senha deve ter pelo menos 8 caracteres'];
        }

        if ($senhaNova !== $senhaConfirma) {
            http_response_code(400);
            return ['error' => 'As senhas não coincidem'];
        }

        $user = $this->repository->findByIdWithSenha($id);
        if (!$user || !password_verify($senhaAtual, $user['senha'])) {
            http_response_code(401);
            return ['error' => 'Senha atual incorreta'];
        }

        $this->repository->updatePassword($id, password_hash($senhaNova, PASSWORD_BCRYPT));
        return ['message' => 'Senha alterada com sucesso'];
    }
}
