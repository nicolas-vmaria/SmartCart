<?php

require_once __DIR__ . '/../core/connection.php';

class AdminRolesRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAllRoles(): array {
        try {
            $stmt = $this->db->query('
                SELECT id, nome_papel, badge, descricao, ver_dashboard, ver_clientes, ver_categorias, ver_produtos, ver_pedidos, ver_admin, ver_curriculos, ver_trabalhos, ver_cupons, ver_relatorios, ver_customizacao, ver_usuarios, ver_configuracoes, ver_marketing
                FROM Papeis
            ');
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
        catch (PDOException $e) {
            throw new RuntimeException('ERRO_BUSCAR_PAPEIS', 0, $e);
        }
    }

    public function createRole(array $role): array {
        try {
            $stmt = $this->db->prepare('
                INSERT INTO Papeis (nome_papel, badge, descricao, ver_dashboard, ver_clientes, ver_categorias, ver_produtos, ver_pedidos, ver_admin, ver_curriculos, ver_trabalhos, ver_cupons, ver_relatorios, ver_customizacao, ver_usuarios, ver_configuracoes, ver_marketing)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ');

            $stmt->execute([
                $role['nome_papel'],
                $role['badge'],
                $role['descricao'],
                $role['ver_dashboard'],
                $role['ver_clientes'],
                $role['ver_categorias'],
                $role['ver_produtos'],
                $role['ver_pedidos'],
                $role['ver_admin'],
                $role['ver_curriculos'],
                $role['ver_trabalhos'],
                $role['ver_cupons'],
                $role['ver_relatorios'],
                $role['ver_customizacao'],
                $role['ver_usuarios'],
                $role['ver_configuracoes'],
                $role['ver_marketing'],
            ]);

            $id = (int)$this->db->lastInsertId();

            return [
                'id'               => $id,
                'nome_papel'       => $role['nome_papel'],
                'badge'            => $role['badge'],
                'descricao'        => $role['descricao'],
                'ver_dashboard'    => $role['ver_dashboard'],
                'ver_clientes'     => $role['ver_clientes'],
                'ver_categorias'   => $role['ver_categorias'],
                'ver_produtos'     => $role['ver_produtos'],
                'ver_pedidos'      => $role['ver_pedidos'],
                'ver_admin'        => $role['ver_admin'],
                'ver_curriculos'   => $role['ver_curriculos'],
                'ver_trabalhos'    => $role['ver_trabalhos'],
                'ver_cupons'       => $role['ver_cupons'],
                'ver_relatorios'   => $role['ver_relatorios'],
                'ver_customizacao' => $role['ver_customizacao'],
                'ver_usuarios'     => $role['ver_usuarios'],
                'ver_configuracoes'=> $role['ver_configuracoes'],
                'ver_marketing'    => $role['ver_marketing'],
            ];
        } catch (PDOException $e) {
            if ($e->getCode() === '23000' && (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), 'key'))) {
                throw new RuntimeException("PAPEL_JA_EXISTE", 0, $e);
            }

            throw new RuntimeException('ERRO_INSERT_PAPEL: ' . $e->getMessage(), 0, $e);
        }
    }

    public function updateRole($id, array $role): bool {
        try {
            $stmt = $this->db->prepare('
                UPDATE Papeis SET nome_papel = ?, badge = ?, descricao = ?, ver_dashboard = ?, ver_clientes = ?, ver_categorias = ?, ver_produtos = ?, ver_pedidos = ?, ver_admin = ?, ver_curriculos = ?, ver_trabalhos = ?, ver_cupons = ?, ver_relatorios = ?, ver_customizacao = ?, ver_usuarios = ?, ver_configuracoes = ?, ver_marketing = ?
                WHERE id = ?
            ');

            $stmt->execute([
                $role['nome_papel'],
                $role['badge'],
                $role['descricao'],
                $role['ver_dashboard'],
                $role['ver_clientes'],
                $role['ver_categorias'],
                $role['ver_produtos'],
                $role['ver_pedidos'],
                $role['ver_admin'],
                $role['ver_curriculos'],
                $role['ver_trabalhos'],
                $role['ver_cupons'],
                $role['ver_relatorios'],
                $role['ver_customizacao'],
                $role['ver_usuarios'],
                $role['ver_configuracoes'],
                $role['ver_marketing'],
                $id,
            ]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_PAPEL: ' . $e->getMessage(), 0, $e);
        }
    }

    public function deleteRole($id) {
        try {
            $stmt = $this->db->prepare('
                DELETE FROM Papeis WHERE id = ?
            ');
            $stmt->execute([$id]);

            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('PAPEL_EM_USO', 0, $e);
            }

            throw new RuntimeException('ERRO_DELETE_PAPEL', 0, $e);
        }
    }
}
