<?php

require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../repository/PushTokenRepository.php';

class AdminPushTokenController {
    private PushTokenRepository $repo;

    public function __construct() {
        AuthMiddleware::handle('admin');
        $this->repo = new PushTokenRepository();
    }

    public function save(array $body): array {
        $token = trim($body['token'] ?? '');

        if (empty($token)) {
            http_response_code(400);
            return ['error' => 'Token obrigatório'];
        }

        $this->repo->save($token);
        return ['message' => 'Token registrado'];
    }
}
