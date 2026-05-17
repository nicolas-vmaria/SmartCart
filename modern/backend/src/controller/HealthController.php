<?php
require_once __DIR__ . '/BaseController.php';

class HealthController extends BaseController {
    public function index() {
        $result = ['message' => 'OK'];
        $this->respond($result);
    }
}