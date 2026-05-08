<?php

class UserService{
    function getAllUsers(){
        return ['message' => 'Listando todos os usuários'];
    }

    function getUserById($id){
        return ['message' => "Usuário com ID: $id"];
    }

    function createUser(){
        return ['message' => 'Usuário criado'];
    }

    function updateUser($id){
        return ['message' => "Usuário $id atualizado"];
    }

    function deleteUser($id){
        return ['message' => "Usuário $id deletado"];
    }
}