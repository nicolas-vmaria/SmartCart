<?php

require_once __DIR__ . '/../core/Jwt.php';
require_once __DIR__ . '/../repository/UserRepository.php';

class AdminAuthService {
    private UserRepository $userRepository;

    public function __construct() {
        $this->userRepository = new UserRepository();
    }

    public function login(array $body): array {
        $email = $body['email'] ?? '';
        $senha = $body['senha'] ?? '';

        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if (!password_verify($senha, $user['senha'])) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if ($user['role'] !== 'admin') {
            http_response_code(403);
            return ['error' => 'Acesso negado'];
        }

        $token = Jwt::generate([
            'userId' => $user['id'],
            'email'  => $user['email'],
            'role'   => $user['role'],
        ]);

        return [
            'token' => $token,
            'user'  => [
                'id'    => $user['id'],
                'nome'  => $user['nome'],
                'email' => $user['email'],
            ]
        ];
    }
}
