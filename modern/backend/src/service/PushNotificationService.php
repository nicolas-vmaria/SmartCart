<?php

require_once __DIR__ . '/../repository/PushTokenRepository.php';

class PushNotificationService {
    private PushTokenRepository $repo;

    public function __construct(PushTokenRepository $repo) {
        $this->repo = $repo;
    }

    public function send(string $title, string $body): void {
        $tokens = $this->repo->findAll();
        if (empty($tokens)) return;
        $this->dispatch($tokens, $title, $body);
    }

    // Separado do curl para permitir override em testes.
    protected function dispatch(array $tokens, string $title, string $body): void {
        $messages = array_map(fn($token) => [
            'to'    => $token,
            'title' => $title,
            'body'  => $body,
            'sound' => 'default',
        ], $tokens);

        $ch = curl_init('https://exp.host/--/exponent/api/v2/push/send');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_POSTFIELDS     => json_encode($messages),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 5,
        ]);
        curl_exec($ch);
    }
}
