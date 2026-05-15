<?php

require_once __DIR__ . '/../repository/UserRepository.php';
require_once __DIR__ . '/../repository/forgotPasswordRepository.php';


class AuthService {
    private UserRepository $userRepository;
    private forgotPasswordRepository $forgotPasswordRepository;

    public function __construct() {
        $this->userRepository = new UserRepository();
        $this->forgotPasswordRepository = new forgotPasswordRepository();
    }

    public function login(array $body): array {
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $senha = isset($body['senha']) ? (string)$body['senha'] : '';

        if ($email === '' || $senha === '') {
            http_response_code(400);
            return ['error' => 'email e senha são obrigatórios'];
        }

        $user = $this->userRepository->findByEmail($email);

        if(!$user || !password_verify($senha, $user['senha'])) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if($user['role'] !== "cliente") {
            http_response_code(403);
            return ['error' => 'Acesso negado para usuários admin'];
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

        $existing = $this->userRepository->findByEmail($email);
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

        $user = $this->userRepository->findByEmail($email);

        $token = Jwt::generate([
            'userId' => $user['id'],
            'email'  => $user['email'],
            'role'   => $user['role'],
        ]);

        return [
            'token' => $token,
            'user'    => [
                'id'    => $user['id'],
                'nome'  => $user['nome'],
                'email' => $user['email'],
                
            ],
        ];
    }

    public function forgotPassword(array $body): array {
        $email = isset($body['email']) ? trim((string)$body['email']) : '';

        $usuario = $this->userRepository->findByEmail($email);
        if (!$usuario) {
            http_response_code(404);
            return ['error' => 'E-mail não encontrado'];
        }

        $token = bin2hex(random_bytes(32));
        $create_at = date('Y-m-d H:i:s');
        $expire_at = date('Y-m-d H:i:s', strtotime('+1 hour'));

        try{
            $this->forgotPasswordRepository->sendEmail([
                "email" => $email,
                "token" => $token,
                "create_at" => $create_at,
                "expire_at" => $expire_at
            ]);

        } catch(Exception $e){
            http_response_code(500);
            return ['error' => 'Erro ao enviar para tabela'];
        }

        require_once __DIR__ . '/../core/Mailer.php';

        try{
            $mailer = new Mailer();
            $mailer->send(
                $email,
                'Redefinição de senha - SmartCart',
                "<div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;'>
                    <h2 style='color: #1a1a1a;'>Redefinição de senha</h2>
                    <p style='color: #555;'>Recebemos uma solicitação para redefinir a senha da sua conta SmartCart.</p>
                    <p style='color: #555;'>Clique no botão abaixo para criar uma nova senha:</p>
                    <a href='http://localhost:5173/reset-password?token={$token}'
                       style='display: inline-block; margin: 20px 0; padding: 12px 24px; background-color: #1f6e3b; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;'>
                        Redefinir Senha
                    </a>
                    <p style='color: #999; font-size: 13px;'>O link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.</p>
                    <hr style='border: none; border-top: 1px solid #e0e0e0; margin-top: 30px;'>
                    <p style='color: #bbb; font-size: 12px;'>SmartCart &copy; 2026</p>
                </div>"
            );

            return ['message' => 'E-mail de redefinição enviado'];
        } catch(Exception $e){
            return ['error' => 'Erro ao enviar'];
        }
        
    }

    public function resetPassword(array $body): array {
        $token = isset($body['token']) ? trim((string)$body['token']) : '';
        $senha = isset($body['senha']) ? trim((string)$body['senha']) : '';

        try{
            $registro = $this->forgotPasswordRepository->findToken($token);

        }catch(Exception $e){
            return ['error' => 'Erro ao buscar token'];
        }

        if(!$registro){
            http_response_code(400);
            return ['error' => 'Token inválido'];
        }

        if(strtotime($registro['expire_at']) < time()){
            http_response_code(400);
            return ['error' => 'Token expirado'];
        }

        try{
            $this->userRepository->updatePassword($registro['email'], password_hash($senha, PASSWORD_DEFAULT));
        } catch (Exception $e){
            return ['Error' => 'Error ao atualizar a senha'];
        }

        $this->forgotPasswordRepository->deleteToken($token);

        return ['message' => 'Senha redefinida com sucesso'];
    }
}
