<?php

class RateLimitMiddleware {
    public static function handle(string $key, int $maxAttempts, int $windowSeconds): void {
        $key = self::clientIp() . ':' . $key;
        $hash = hash('sha256', $key);
        $now = time();
        $path = self::storagePath();

        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        $file = fopen($path, 'c+');
        if (!$file) {
            return;
        }

        try {
            flock($file, LOCK_EX);

            $raw = stream_get_contents($file);
            $limits = $raw ? json_decode($raw, true) : [];
            if (!is_array($limits)) {
                $limits = [];
            }

            self::cleanup($limits, $now);

            $entry = $limits[$hash] ?? [
                'attempts' => 0,
                'reset_at' => $now + $windowSeconds,
            ];

            if (($entry['reset_at'] ?? 0) <= $now) {
                $entry = [
                    'attempts' => 0,
                    'reset_at' => $now + $windowSeconds,
                ];
            }

            if (($entry['attempts'] ?? 0) >= $maxAttempts) {
                $retryAfter = max(1, ($entry['reset_at'] ?? $now) - $now);
                http_response_code(429);
                header('Retry-After: ' . $retryAfter);
                echo json_encode([
                    'error' => 'Limite de tentativas atingido. Tente novamente mais tarde.',
                    'retry_after' => $retryAfter,
                ]);
                exit;
            }

            $entry['attempts']++;
            $limits[$hash] = $entry;

            ftruncate($file, 0);
            rewind($file);
            fwrite($file, json_encode($limits));
        } finally {
            flock($file, LOCK_UN);
            fclose($file);
        }
    }

    private static function storagePath(): string {
        return sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'smartcart-rate-limits.json';
    }

    private static function clientIp(): string {
        $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
        if ($forwarded !== '') {
            return trim(explode(',', $forwarded)[0]);
        }

        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    private static function cleanup(array &$limits, int $now): void {
        foreach ($limits as $hash => $entry) {
            if (!is_array($entry) || ($entry['reset_at'] ?? 0) <= $now) {
                unset($limits[$hash]);
            }
        }
    }
}
