<?php

require_once __DIR__ . '/../service/UserService.php';

    class UserController{
        private UserService $service;

        public function __construct(){
            $this->service = new UserService();
        }

        public function index(){
            echo json_encode($this->service->getAllUsers());
        }

        public function show($id){
            echo json_encode($this->service->getUserById($id));
        }

        public function store(){
            echo json_encode($this->service->createUser());
        }

        public function update($id){
            echo json_encode($this->service->updateUser($id));
        }

        public function destroy($id){
            echo json_encode($this->service->deleteUser($id));
        }
    }