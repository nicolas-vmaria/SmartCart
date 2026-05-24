<?php

require_once __DIR__ . '/../core/connection.php';

class UserRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare('
            SELECT u.id, u.nome, u.email, u.tel, u.senha, u.is_admin,
                   p.nome_papel AS role,
                   p.ver_dashboard, p.ver_clientes, p.ver_categorias,
                   p.ver_produtos, p.ver_pedidos, p.ver_admin, p.ver_curriculos
            FROM Usuario u
            JOIN Papeis p ON p.id = u.papel_id
            WHERE u.email = ?
        ');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function register(array $user): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Usuario (papel_id, is_admin, nome, email, tel, senha)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                1,
                false,
                $user['nome'],
                $user['email'],
                $user['tel'],
                $user['senha'],
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id' => $id,
                'nome' => $user['nome'],
                'email' => $user['email'],
                'tel' => $user['tel'],
                'role' => $user['role'],
            ];
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' && str_contains($e->getMessage(), 'Duplicate')) {
                throw new RuntimeException('EMAIL_ALREADY_EXISTS', 0, $e);
            }
            throw $e;
        }
    }

    public function updatePassword($email, $senha){
        try{
            $stmt = $this->db->prepare('
                UPDATE Usuario SET senha = ? WHERE email = ?
            ');

            $stmt->execute([$senha, $email]);
        }catch(PDOException $e){
            throw new RuntimeException('ERRO_UPDATE_PASSWORD', 0, $e);
        }
    }
}
