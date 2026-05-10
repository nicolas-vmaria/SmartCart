<?php

require_once  __DIR__  . '/../core/Jwt.php';

class AuthMiddleware{
    public static function handle(): array{
        $headers = getallheaders();
        $auth  = $headers['Authorization'] ?? '';

        if(!str_starts_with($auth, 'Bearer ')){
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }

        $token = substr($auth, 7);

        try{
            return Jwt::verify($token);
        } catch (Exception $e){
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }
}