<?php

require_once __DIR__ . '/../service/ContactService.php';

class ContactController {
    private ContactService $service;

    public function __construct() {
        $this->service = new ContactService();
    }

    public function send() {
        echo json_encode($this->service->sendMessage());
    }

    public function apply() {
        echo json_encode($this->service->sendApplication());
    }
}
