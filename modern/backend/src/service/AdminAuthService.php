<?php

require_once __DIR__ . '/../core/Jwt.php';
require_once __DIR__ . '/../repository/AuthRepository.php';

class AdminAuthService {
    private AuthRepository $AuthRepository;

    public function __construct() {
        $this->AuthRepository = new AuthRepository();
    }

    public function login(array $body): array {
        $email = $body['email'] ?? '';
        $senha = $body['senha'] ?? '';

        $user = $this->AuthRepository->findByEmail($email);

        if (!$user) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if (!password_verify($senha, $user['senha'])) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if (!$user['is_admin']) {
            http_response_code(403);
            return ['error' => 'Acesso negado'];
        }

        $token = Jwt::generate([
            'userId' => $user['id'],
            'email'  => $user['email'],
            'role'   => 'admin',
            'perms'  => [
                'ver_dashboard'    => (bool)$user['ver_dashboard'],
                'ver_clientes'     => (bool)$user['ver_clientes'],
                'ver_produtos'     => (bool)$user['ver_produtos'],
                'ver_pedidos'      => (bool)$user['ver_pedidos'],
                'ver_categorias'   => (bool)$user['ver_categorias'],
                'ver_admin'        => (bool)$user['ver_admin'],
                'ver_curriculos'   => (bool)$user['ver_curriculos'],
                'ver_trabalhos'    => (bool)$user['ver_trabalhos'],
                'ver_cupons'       => (bool)$user['ver_cupons'],
                'ver_relatorios'   => (bool)$user['ver_relatorios'],
                'ver_usuarios'     => (bool)$user['ver_usuarios'],
                'ver_configuracoes'=> (bool)$user['ver_configuracoes'],
            ],
        ]);

        return [
            'token' => $token,
            'user'  => [
                'id'          => $user['id'],
                'nome'        => $user['nome'],
                'email'       => $user['email'],
                'nome_papel'  => $user['role'],
                'permissions' => [
                    'dashboard'    => (bool)$user['ver_dashboard'],
                    'clientes'     => (bool)$user['ver_clientes'],
                    'produtos'     => (bool)$user['ver_produtos'],
                    'pedidos'      => (bool)$user['ver_pedidos'],
                    'categorias'   => (bool)$user['ver_categorias'],
                    'papeis'       => (bool)$user['ver_admin'],
                    'curriculos'   => (bool)$user['ver_curriculos'],
                    'trabalhos'    => (bool)$user['ver_trabalhos'],
                    'cupons'       => (bool)$user['ver_cupons'],
                    'relatorios'   => (bool)$user['ver_relatorios'],
                    'usuarios'     => (bool)$user['ver_usuarios'],
                    'configuracoes'=> (bool)$user['ver_configuracoes'],
                ],
            ]
        ];
    }
}
