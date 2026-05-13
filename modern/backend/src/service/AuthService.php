<?php

require_once __DIR__ . '/../repository/UserRepository.php';

class AuthService {
    private ?UserRepository $userRepository = null;

    public function __construct() {
        $this->userRepository = new UserRepository();
    }

    public function login() {
        return ['message' => 'Login realizado com sucesso'];
    }

    
    public function register(array $body): array {
        $nome = isset($body['nome']) ? trim((string)$body['nome']) : '';
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $senha = isset($body['senha']) ? (string)$body['senha'] : '';

        if ($nome === '' || $email === '' || $senha === '') {
            http_response_code(400);
            return ['error' => 'nome, email e senha são obrigatórios'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido'];
        }

        if (strlen($senha) < 8) {
            http_response_code(400);
            return ['error' => 'A senha deve ter pelo menos 8 caracteres'];
        }

        $user = $this->userRepository->register([
            'id'    => $id,
            'nome'  => $nome,
            'email' => $email,
            'senha' => password_hash($senha, PASSWORD_DEFAULT),
        ]);

        return [
            'message' => 'Usuário cadastrado com sucesso',
            'user'    => [
                'id'    => $id,
                'nome'  => $nome,
                'email' => $email,
            ],
        ];
    }

    public function forgotPassword() {
        return ['message' => 'E-mail de redefinição enviado'];
    }

    public function resetPassword() {
        return ['message' => 'Senha redefinida com sucesso'];
    }
}
