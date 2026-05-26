<?php

require_once __DIR__ . '/../repository/ProfileRepository.php';

class ProfileService {
    private ProfileRepository $repository;

    public function __construct() {
        $this->repository = new ProfileRepository();
    }

    public function getProfile(int $id): array {
        try {
            $profile = $this->repository->getProfile($id);
            $recentOrders = $this->repository->getRecentOrders($id);

            if (!$profile) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }   

            return [
                'profile' => $profile,
                'orders'  => $recentOrders,
            ];

        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }

    public function updateProfile(int $id, array $body): array {
        $nome     = trim($body['nome'] ?? '');
        $tel      = trim($body['tel'] ?? '');

        if (!$nome || !$tel) {
            http_response_code(400);
            return ['error' => 'Campos obrigatórios ausentes: nome, email, tel'];
        }

        $tel = preg_replace('/\D/', '', $tel);
        if (strlen($tel) < 10 || strlen($tel) > 11) {
            http_response_code(400);
            return ['error' => 'Telefone inválido'];
        }

        try {
            $profile = $this->repository->getProfile($id);

            if (!$profile) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            $updated = $this->repository->updateProfile($id, [
                'nome'     => $nome,
                'tel'      => $tel,
            ]);

            return [
                'message' => 'Perfil atualizado com sucesso',
            ];

        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }

    }

    public function updateAddress(int $id, array $body): array {
        $cep      = trim($body['cep'] ?? '');
        $rua      = trim($body['rua'] ?? '');
        $numero   = trim($body['numero'] ?? '');
        $complemento = trim($body['complemento'] ?? '');
        $cidade   = trim($body['cidade'] ?? '');
        $estado   = trim($body['estado'] ?? '');

        if (!$cep || !$rua || !$numero || !$complemento || !$cidade || !$estado) {
            http_response_code(400);
            return ['error' => 'Campos obrigatórios ausentes: cep, rua, numero, complemento, cidade, estado'];
        }

        $cep = preg_replace('/\D/', '', $cep);
        if (strlen($cep) !== 8) {
            http_response_code(400);
            return ['error' => 'CEP inválido'];
        }

        try {
            $profile = $this->repository->getProfile($id);

            if (!$profile) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            $address = [
                'cep'      => $cep,
                'rua'      => $rua,
                'numero'   => $numero,
                'complemento' => $complemento,
                'cidade'   => $cidade,
                'estado'   => $estado,
            ];

            $this->repository->updateAddress($id, $address);
            
            return [
                'message' => 'Endereço atualizado com sucesso',
                'address' => $address,
            ];

        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }

    public function updatePassword(int $id, array $body): array {
    $senha_atual    = $body['senha_atual'] ?? '';
    $nova_senha     = $body['nova_senha'] ?? '';
    $confirmar_senha = $body['confirmar_senha'] ?? '';

    if (!$senha_atual || !$nova_senha || !$confirmar_senha) {
        http_response_code(400);
        return ['error' => 'Campos obrigatórios ausentes'];
    }

    if ($nova_senha !== $confirmar_senha) {
        http_response_code(400);
        return ['error' => 'A nova senha e a confirmação não coincidem'];
    }

    if (strlen($nova_senha) < 8) {
        http_response_code(400);
        return ['error' => 'A nova senha deve ter pelo menos 8 caracteres'];
    }

    $user = $this->repository->findById($id);
    if (!$user || !password_verify($senha_atual, $user['senha'])) {
        http_response_code(401);
        return ['error' => 'Senha atual incorreta'];
    }

    try {
        $this->repository->updatePassword($id, [
            'senha' => password_hash($nova_senha, PASSWORD_DEFAULT)
        ]);
        return ['message' => 'Senha atualizada com sucesso'];
    } catch (RuntimeException $e) {
        http_response_code(500);
        return ['error' => 'Erro ao atualizar senha'];
    }
}

    public function updateAvatar(int $id, array $body): array {
        $foto_url = trim($body['foto_url'] ?? '');

        if (!$foto_url) {
            http_response_code(400);
            return ['error' => 'Campo obrigatório ausente: foto_url'];
        }

        try {
            $profile = $this->repository->getProfile($id);

            if (!$profile) {
                http_response_code(404);
                return ['error' => 'Usuário não encontrado'];
            }

            $updated = $this->repository->updateAvatar($id, [
                'foto_url' => $foto_url,
            ]);

            return [
                'message' => 'Foto de perfil atualizada com sucesso',
            ];

        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
        }
    }
}