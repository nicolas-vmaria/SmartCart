<?php 

require_once __DIR__ . '/../core/connection.php';

class ProfileRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findById(int $id): array|false {
        try {
            $stmt = $this->db->prepare('SELECT id, senha FROM Usuario WHERE id = ?');
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_FIND_USER', 0, $e);
        }
    }

    public function getProfile(int $id): array|false {
        try {
            $stmt = $this->db->prepare('
            SELECT 
                u.id, u.nome, u.email, u.tel, u.foto_url, u.created_at,
                u.cep, u.rua, u.numero, u.complemento, u.cidade, u.estado,
                p.nome_papel AS role,
                COUNT(ped.id) AS total_pedidos,
                COALESCE(SUM(ped.total), 0) AS total_gasto
            FROM Usuario u
            JOIN Papeis p ON p.id = u.papel_id
            LEFT JOIN Pedidos ped ON ped.usuario_id = u.id
            WHERE u.id = ?
            GROUP BY u.id
        ');
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (PDOException $e) {
    throw new RuntimeException('ERRO_GET_PROFILE', 0, $e);
}
    }

    public function getRecentOrders(int $id): array {
        try {
            $stmt = $this->db->prepare('
            SELECT 
                p.id,
                p.status,
                p.total,
                p.created_at,
                COUNT(ip.id) AS qtd_itens
            FROM Pedidos p
            LEFT JOIN Itens_Pedido ip ON ip.pedido_id = p.id
            WHERE p.usuario_id = ?
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 3
        ');
        $stmt->execute([$id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_RECENT_ORDERS', 0, $e);
    }
}
    


    public function updateProfile(int $id, array $body): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Usuario 
                 Set nome = :nome,
                     tel = :tel
                WHERE id = :id
            ');
            $stmt->execute([
                ':nome'     => $body['nome'] ?? '',
                ':tel'      => $body['tel'] ?? '',
                ':id'       => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_PROFILE', 0, $e);
        }

    }

    public function updateAddress(int $id, array $body): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Usuario 
                 Set cep = :cep,
                     rua = :rua,
                     numero = :numero,
                     complemento = :complemento,
                     cidade = :cidade,
                     estado = :estado
                WHERE id = :id
            ');
            $stmt->execute([
                ':cep'      => $body['cep'] ?? '',
                ':rua'      => $body['rua'] ?? '',
                ':numero'   => $body['numero'] ?? '',
                ':complemento' => $body['complemento'] ?? '',
                ':cidade'   => $body['cidade'] ?? '',
                ':estado'   => $body['estado'] ?? '',
                ':id'       => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
    throw new RuntimeException('ERRO_UPDATE_ADDRESS', 0, $e);
}
    }

    public function updatePassword(int $id, array $body): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Usuario 
                 Set senha = :senha
                WHERE id = :id
            ');
            $stmt->execute([
                ':senha'    => $body['senha'],
                ':id'       => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
    throw new RuntimeException('ERRO_UPDATE_PASSWORD', 0, $e);
}
    }

    public function updateAvatar(int $id, array $body): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Usuario 
                 Set foto_url = :foto_url
                WHERE id = :id
            ');
            $stmt->execute([
                ':foto_url' => $body['foto_url'] ?? '',
                ':id'       => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_AVATAR', 0, $e);
        }
    }

}