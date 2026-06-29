<?php

class BaseController {
    protected function getBody(): ?array {
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);
        return is_array($body) ? $body : null;
    }

    protected function respond(array $result, int $successCode = 200): void {
        if (isset($result['error'])) {
            if (http_response_code() < 400) {
                http_response_code(400);
            }
            echo json_encode($result);
            return;
        }
        http_response_code($successCode);
        echo json_encode($result);
    }
}
