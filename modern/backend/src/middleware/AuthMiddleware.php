<?php

require_once  __DIR__  . '/../core/Jwt.php';

class AuthMiddleware{
    public static function handle(string $requiredRole = null, string $requiredPerm = null): array{
        $headers = getallheaders();
        $auth  = $headers['Authorization'] ?? '';

        if(!str_starts_with($auth, 'Bearer ')){
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $token = substr($auth, 7);

        try{
            $payload = Jwt::verify($token);
        } catch (Exception $e){
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }

        if ($requiredRole !== null && ($payload['role'] ?? '') !== $requiredRole) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }

        if ($requiredPerm !== null && !($payload['perms'][$requiredPerm] ?? false)) {
            http_response_code(403);
            echo json_encode(['error' => 'Sem permissão para esta ação']);
            exit;
        }

        return $payload;
    }
}