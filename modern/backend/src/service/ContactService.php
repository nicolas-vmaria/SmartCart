<?php

class ContactService {
    public function sendMessage(): array {
        $body = json_decode(file_get_contents('php://input'), true);

        $nome     = isset($body['nome'])     ? trim((string)$body['nome'])     : '';
        $email    = isset($body['email'])    ? trim((string)$body['email'])    : '';
        $mensagem = isset($body['mensagem']) ? trim((string)$body['mensagem']) : '';

        if (!$nome || !$email || !$mensagem) {
            http_response_code(400);
            return ['error' => 'Preencha todos os campos'];
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido'];
        }

        try {
            require_once __DIR__ . '/../core/Mailer.php';
            $mailer = new Mailer();
            $mailer->send(
                'contato.smartcart@gmail.com',
                'Contato de ' . $nome . ' <' . $email . '> — SmartCart',
                "
                <div style='font-family:sans-serif;max-width:600px;margin:0 auto'>
                    <h2 style='color:#1a5c2a'>Nova mensagem pelo formulário de contato</h2>
                    <p><strong>Nome:</strong> " . htmlspecialchars($nome) . "</p>
                    <p><strong>E-mail:</strong> " . htmlspecialchars($email) . "</p>
                    <hr style='border:1px solid #e5e7eb;margin:16px 0'>
                    <p><strong>Mensagem:</strong></p>
                    <p style='white-space:pre-line'>" . htmlspecialchars($mensagem) . "</p>
                </div>
                ",
                $email
            );
            return ['message' => 'Mensagem enviada com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao enviar mensagem. Tente novamente.'];
        }
    }

    public function sendApplication(): array {
        return ['message' => 'Candidatura enviada com sucesso'];
    }
}
