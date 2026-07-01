<?php

require_once __DIR__ . '/../repository/AuthRepository.php';
require_once __DIR__ . '/../repository/forgotPasswordRepository.php';
require_once __DIR__ . '/../core/Jwt.php';
require_once __DIR__ . '/../core/Mailer.php';


class AuthService {
    private AuthRepository $authRepository;
    private forgotPasswordRepository $forgotPasswordRepository;

    public function __construct(?AuthRepository $auth = null, ?forgotPasswordRepository $forgot = null) {
        $this->authRepository = $auth ?? new AuthRepository();
        $this->forgotPasswordRepository = $forgot ?? new forgotPasswordRepository();
    }

    public function login(array $body): array {
        $email = isset($body['email']) ? trim((string)$body['email']) : '';
        $senha = isset($body['senha']) ? (string)$body['senha'] : '';

        if ($email === '' || $senha === '') {
            http_response_code(400);
            return ['error' => 'email e senha são obrigatórios'];
        }

        $user = $this->authRepository->findByEmail($email);

        if(!$user || !password_verify($senha, $user['senha'])) {
            http_response_code(401);
            return ['error' => 'Credenciais inválidas'];
        }

        if(strtolower($user['role']) !== 'cliente') {
            http_response_code(403);
            return ['error' => 'Acesso negado para usuários admin'];
        }

        if (!(bool)$user['email_verificado']) {
            http_response_code(403);
            return ['error' => 'Confirme seu e-mail antes de fazer login.'];
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
        $tel = isset($body['tel']) ? (string)$body['tel'] : '';
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

        if (!preg_match('/^\d{11}$/', $tel)) {
            http_response_code(400);
            return ['error' => 'Telefone inválido'];
        }

        $existing = $this->authRepository->findByEmail($email);
        if ($existing) {
            http_response_code(409);
            return ['error' => 'Já existe um usuário com esse e-mail'];
        }

        try {
            $user = $this->authRepository->register([
                'nome'  => $nome,
                'email' => $email,
                'tel' => $tel,
                'senha' => password_hash($senha, PASSWORD_DEFAULT),
            ]);
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'EMAIL_ALREADY_EXISTS') {
                http_response_code(409);
                return ['error' => 'Já existe um usuário com esse e-mail'];
            }
            throw $e;
        }

        $user = $this->authRepository->findByEmail($email);

        $verificationToken = bin2hex(random_bytes(32));
        $this->authRepository->saveVerificationToken($user['id'], $verificationToken);

        $frontendUrl = rtrim($_ENV['FRONTEND_URL'] ?? 'http://localhost:5173', '/');
        $verifyLink  = "{$frontendUrl}/verificar-email?token={$verificationToken}";

        try {
            $mailer = new Mailer();
            $mailer->send(
                $user['email'],
                'Bem-vindo à SmartCart! Confirme seu e-mail',
                $this->buildWelcomeEmail($user['nome'], $verifyLink)
            );
        } catch (Exception $e) {
            error_log('Mailer error: ' . $e->getMessage());
        }

        return ['message' => 'Cadastro realizado! Verifique seu e-mail para ativar sua conta.'];
    }

    public function verifyEmail(string $token): array {
        if ($token === '') {
            http_response_code(400);
            return ['error' => 'Token inválido'];
        }

        $user = $this->authRepository->findByVerificationToken($token);
        if (!$user) {
            http_response_code(400);
            return ['error' => 'Token inválido ou já utilizado'];
        }

        $this->authRepository->markEmailVerified((int)$user['id']);

        $jwt = Jwt::generate([
            'userId' => $user['id'],
            'email'  => $user['email'],
            'role'   => 'cliente',
        ]);

        return [
            'message' => 'E-mail confirmado com sucesso!',
            'token'   => $jwt,
            'user'    => [
                'id'    => $user['id'],
                'nome'  => $user['nome'],
                'email' => $user['email'],
            ],
        ];
    }

    private function buildWelcomeEmail(string $nome, string $verifyLink): string {
        $nome = htmlspecialchars($nome);
        $verifyLink = htmlspecialchars($verifyLink);
        return "
<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;'>
    <div style='text-align: center; margin-bottom: 28px;'>
        <h1 style='color: #16a34a; font-size: 28px; margin: 0;'>SmartCart</h1>
        <p style='color: #9ca3af; font-size: 13px; margin: 4px 0 0;'>Loja Inteligente</p>
    </div>

    <h2 style='color: #111827; font-size: 20px; margin: 0 0 8px;'>Olá, {$nome}! Confirme seu e-mail 👋</h2>
    <p style='color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 24px;'>
        Clique no botão abaixo para confirmar seu e-mail e ativar sua conta SmartCart.
    </p>

    <div style='text-align: center; margin-bottom: 24px;'>
        <a href='{$verifyLink}'
           style='display: inline-block; padding: 14px 32px; background-color: #16a34a; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;'>
            Confirmar e-mail
        </a>
    </div>

    <div style='background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;'>
        <p style='color: #15803d; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;'>Presente de boas-vindas</p>
        <p style='color: #111827; font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 0 0 8px; font-family: monospace;'>BEMVINDO10</p>
        <p style='color: #6b7280; font-size: 13px; margin: 0;'>10% de desconto na sua primeira compra</p>
    </div>

    <p style='color: #9ca3af; font-size: 12px;'>Se você não criou esta conta, ignore este e-mail.</p>

    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 0 0 16px;'>
    <p style='color: #9ca3af; font-size: 12px; text-align: center; margin: 0;'>SmartCart &copy; " . date('Y') . " — Loja Inteligente</p>
</div>";
    }

    public function forgotPassword(array $body): array {
        $email = isset($body['email']) ? trim((string)$body['email']) : '';

        $usuario = $this->authRepository->findByEmail($email);
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

    public function googleLogin(array $body): array {
        try {
            $email = isset($body['email']) ? trim((string)$body['email']) : '';
            $nome  = isset($body['name'])  ? trim((string)$body['name'])  : '';

            if ($email === '') {
                http_response_code(400);
                return ['error' => 'E-mail é obrigatório'];
            }

            $user = $this->authRepository->findByEmail($email);

            if (!$user) {
                $this->authRepository->register([
                    'nome'  => $nome ?: explode('@', $email)[0],
                    'email' => $email,
                    'tel'   => '',
                    'senha' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
                ]);
                $user = $this->authRepository->findByEmail($email);
                $this->authRepository->markEmailVerified((int)$user['id']);
                $user['email_verificado'] = true;
            }

            if ($user['role'] !== 'cliente') {
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
                ],
            ];
        } catch (\Throwable $e) {
            http_response_code(500);
            return ['error' => $e->getMessage()];
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
            $this->authRepository->updatePassword($registro['email'], password_hash($senha, PASSWORD_DEFAULT));
        } catch (Exception $e){
            return ['Error' => 'Error ao atualizar a senha'];
        }

        $this->forgotPasswordRepository->deleteToken($token);

        return ['message' => 'Senha redefinida com sucesso'];
    }
}
