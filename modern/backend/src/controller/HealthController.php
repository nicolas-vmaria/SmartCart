<?php

class HealthController {
    public function index() {
        echo json_encode(['status' => 'ok', 'message' => 'API is healthy']);
    }
}