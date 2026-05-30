<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use Cloudinary\Cloudinary as CloudinarySDK;
use Cloudinary\Api\Admin\AdminApi;

class Cloudinary {
    private static ?CloudinarySDK $instance = null;

    private static function getInstance(): CloudinarySDK {
        if (self::$instance === null) {
            self::$instance = new CloudinarySDK([
                'cloud' => [
                    'cloud_name' => $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '',
                    'api_key'    => $_ENV['CLOUDINARY_API_KEY']    ?? '',
                    'api_secret' => $_ENV['CLOUDINARY_API_SECRET'] ?? '',
                ],
            ]);
        }
        return self::$instance;
    }

    public static function deleteImage(string $url): void {
        if (!$url) return;

        // Extrai o public_id da URL (ex: .../image/upload/v123/abc.jpg → abc)
        if (!preg_match('#/image/upload/(?:v\d+/)?([^.]+)#', $url, $m)) return;

        $publicId = $m[1];

        try {
            $adminApi = new AdminApi(self::getInstance()->configuration);
            $adminApi->deleteAssets([$publicId]);
        } catch (\Throwable $e) {
            // Falha silenciosa — não bloqueia a deleção do banco
        }
    }
}
