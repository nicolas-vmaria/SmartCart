<?php

use Firebase\JWT\ExpiredException;

class Jwt{
    private static function getSecret(): string {
        return $_ENV['JWT_SECRET'];
    }

    private static function base64url(string $data): string{
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public static function generate(array $payload): string{
        $header = self::base64url(json_encode([
            'alg'=> 'HS256',
            'typ'=> 'JWT'
        ]));


        $payload['iat'] = time();
        $payload['exp'] = time() + (8 * 3600);

        $body = self::base64url(json_encode(($payload)));

        $signature = self::base64url(
            hash_hmac('sha256', "$header.$body", self::getSecret(), true)
        );

        return "$header.$body.$signature";
    }

    public static function verify(string $token): array {
        $parts = explode('.', $token);

        if(count($parts) !== 3){
            throw new Exception('Token inválido', 401);
        }

        [$header, $body, $signature] = $parts;

        $expected = self::base64url(
            hash_hmac('sha256', "$header.$body", self::getSecret(), true)
        );

        if(!hash_equals($expected, $signature)) {
            throw new Exception('Assinatura inválida', 401);
        }

        $payload  = json_decode(base64_decode(strtr($body, '-_', '+/')), true);

        if ($payload['exp'] < time()) {
            throw new Exception('Token expirado', 401);
        }

        return $payload;
    }
}