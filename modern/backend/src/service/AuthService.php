<?php

class AuthService {
    public function login() {
        return ['message' => 'Login realizado com sucesso'];
    }

    public function register() {
        return ['message' => 'Usuário cadastrado com sucesso'];
    }

    public function forgotPassword() {
        return ['message' => 'E-mail de redefinição enviado'];
    }

    public function resetPassword() {
        return ['message' => 'Senha redefinida com sucesso'];
    }
}
