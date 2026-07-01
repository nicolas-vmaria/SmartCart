<?php

class Mailer {
    private string $apiKey;
    private string $fromEmail;
    private string $fromName;

    public function __construct() {
        $this->apiKey    = $_ENV['BREVO_API_KEY']    ?? '';
        $this->fromEmail = $_ENV['MAIL_USER']         ?? '';
        $this->fromName  = $_ENV['MAIL_FROM_NAME']    ?? 'SmartCart';
    }

    public function send(
        string $para,
        string $assunto,
        string $corpo,
        string $replyTo = '',
        ?string $anexoConteudo = null,
        string $anexoNome = 'anexo.pdf'
    ): void {
        $payload = [
            'sender'      => ['name' => $this->fromName, 'email' => $this->fromEmail],
            'to'          => [['email' => $para]],
            'subject'     => $assunto,
            'htmlContent' => $corpo,
        ];

        if ($replyTo !== '') {
            $payload['replyTo'] = ['email' => $replyTo];
        }

        if ($anexoConteudo !== null) {
            $payload['attachment'] = [[
                'name'    => $anexoNome,
                'content' => base64_encode($anexoConteudo),
            ]];
        }

        $isDev = ($_ENV['APP_ENV'] ?? 'production') !== 'production';

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'api-key: ' . $this->apiKey,
                'Content-Type: application/json',
                'Accept: application/json',
            ],
            CURLOPT_TIMEOUT        => 15,
            CURLOPT_SSL_VERIFYPEER => !$isDev,
            CURLOPT_SSL_VERIFYHOST => $isDev ? 0 : 2,
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);

        if ($curlError !== '') {
            throw new \RuntimeException('Mailer curl error: ' . $curlError);
        }
        if ($httpCode < 200 || $httpCode >= 300) {
            $body = json_decode($response, true);
            throw new \RuntimeException('Brevo API error ' . $httpCode . ': ' . ($body['message'] ?? $response));
        }
    }
}
