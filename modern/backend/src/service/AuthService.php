<?php

require_once __DIR__ . '/../repository/UserRepository.php';

class AuthService {
    private UserRepository $userRepository;

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

        $existing = $this->userRepository()->findByEmail($email);
        if ($existing) {
            http_response_code(409);
            return ['error' => 'Já existe um usuário com esse e-mail'];
        }

        try {
            $user = $this->userRepository->register([
                'nome'  => $nome,
                'email' => $email,
                'senha' => password_hash($senha, PASSWORD_DEFAULT),
            ]);
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_ALREADY_EXISTS') {
                http_response_code(409);
                return ['error' => 'Já existe um usuário com esse e-mail'];
            }
            throw $e;
        }

        return [
            'message' => 'Usuário cadastrado com sucesso',
            'user'    => [
                'id'    => $user['id'],
                'nome'  => $user['nome'],
                'email' => $user['email'],
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
