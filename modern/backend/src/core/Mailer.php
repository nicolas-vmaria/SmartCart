<?php

class Mailer {
    private string $apiKey;
    private string $from;

    public function __construct() {
        $this->apiKey = $_ENV['RESEND_API_KEY'];
        $this->from   = $_ENV['MAIL_FROM_NAME'] . ' <' . $_ENV['MAIL_FROM'] . '>';
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
            'from'    => $this->from,
            'to'      => [$para],
            'subject' => $assunto,
            'html'    => $corpo,
        ];

        if ($replyTo !== '') {
            $payload['reply_to'] = $replyTo;
        }

        if ($anexoConteudo !== null) {
            $payload['attachments'] = [[
                'filename' => $anexoNome,
                'content'  => base64_encode($anexoConteudo),
            ]];
        }

        $ch = curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_HTTPHEADER     => [
                'Authorization: Bearer ' . $this->apiKey,
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT        => 15,
        ]);

        $response  = curl_exec($ch);
        $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError !== '') {
            throw new \RuntimeException('Mailer curl error: ' . $curlError);
        }
        if ($httpCode < 200 || $httpCode >= 300) {
            $body = json_decode($response, true);
            throw new \RuntimeException('Resend API error ' . $httpCode . ': ' . ($body['message'] ?? $response));
        }
    }
}
