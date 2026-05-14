<?php

require_once __DIR__ . '/../core/connection.php';

class forgotPasswordRepository{
    private PDO $db;

    public function __construct(){
        $this->db = Connection::get();
    }

    public function sendEmail(array $query){
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Resetar_Senha (email, token, create_at, expire_at)
                VALUES (?, ?, ?, ?)
            ');

            $stmt->execute([
                $query['email'],
                $query['token'],
                $query['create_at'],
                $query['expire_at']
            ]);
        } catch(Exception $e) {
            throw new RuntimeException('ERRO_INSERT_TOKEN', 0, $e);
        }
    }

    public function findToken($token){
        try {
            $stmt = $this->db->prepare('
                SELECT * FROM Resetar_Senha WHERE token = ?
            ');

            $stmt->execute($token);

            return $stmt->fetch();
        } catch(Exception $e) {
            throw new RuntimeException('ERRO_BUSCAR_TOKEN', 0, $e);
        }
    }

    public function deleteToken($token){
        try{
            $stmt = $this->db->prepare('
                DELETE FROM Resetar_Senha WHERE token = ?
            ');

            $stmt->execute([$token]);
        } catch (PDOException $e){
            throw new RuntimeException('ERRO_DELETAR_TOKEN', 0, $e);
        }
    }
}
