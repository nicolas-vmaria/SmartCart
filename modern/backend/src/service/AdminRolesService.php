<?php

require_once __DIR__ . '/../repository/AdminRolesRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';

class AdminRolesService {
    private AdminRolesRepository $repository;

    public function __construct(?AdminRolesRepository $repo = null) {
        $this->repository = $repo ?? new AdminRolesRepository();
    }

    public function validateRole(array $body): array {
        $nome_papel = isset($body['nome_papel']) ? ucwords(trim(strtolower((string)$body['nome_papel']))) : '';
        $badge       = isset($body['badge']) ? trim((string)$body['badge']) : '';
        $descricao   = isset($body['descricao']) ? ucwords(trim(strtolower((string)$body['descricao']))) : '';
        $ver_dashboard = ($body['ver_dashboard'] === 'true' || $body['ver_dashboard'] === '1') ? 1 : 0;
        $ver_clientes  = ($body['ver_clientes']  === 'true' || $body['ver_clientes']  === '1') ? 1 : 0;
        $ver_categorias  = ($body['ver_categorias']  === 'true' || $body['ver_categorias']  === '1') ? 1 : 0;
        $ver_produtos  = ($body['ver_produtos']  === 'true' || $body['ver_produtos']  === '1') ? 1 : 0;
        $ver_pedidos  = ($body['ver_pedidos']  === 'true' || $body['ver_pedidos']  === '1') ? 1 : 0;
        $ver_admin  = ($body['ver_admin']  === 'true' || $body['ver_admin']  === '1') ? 1 : 0;
        $ver_curriculos   = ($body['ver_curriculos']   === 'true' || $body['ver_curriculos']   === '1') ? 1 : 0;
        $ver_trabalhos    = ($body['ver_trabalhos']    === 'true' || $body['ver_trabalhos']    === '1') ? 1 : 0;
        $ver_cupons       = ($body['ver_cupons']       === 'true' || $body['ver_cupons']       === '1') ? 1 : 0;
        $ver_relatorios   = ($body['ver_relatorios']   === 'true' || $body['ver_relatorios']   === '1') ? 1 : 0;
        $ver_customizacao = ($body['ver_customizacao'] === 'true' || $body['ver_customizacao'] === '1') ? 1 : 0;
        $ver_usuarios     = ($body['ver_usuarios']     === 'true' || $body['ver_usuarios']     === '1') ? 1 : 0;
        $ver_configuracoes= ($body['ver_configuracoes']=== 'true' || $body['ver_configuracoes']=== '1') ? 1 : 0;
        $ver_marketing    = ($body['ver_marketing']    === 'true' || $body['ver_marketing']    === '1') ? 1 : 0;
        $ver_reviews      = ($body['ver_reviews']      === 'true' || $body['ver_reviews']      === '1') ? 1 : 0;
        $ver_auditoria    = ($body['ver_auditoria']    === 'true' || $body['ver_auditoria']    === '1') ? 1 : 0;
        $ver_reports      = ($body['ver_reports']      === 'true' || $body['ver_reports']      === '1') ? 1 : 0;
        $ver_chamados     = ($body['ver_chamados']     === 'true' || $body['ver_chamados']     === '1') ? 1 : 0;

        if (!$nome_papel || !$badge) {
            throw new InvalidArgumentException("Campos obrigatórios ausentes: nome_papel, badge");
        }

        return [
            'nome_papel'       => $nome_papel,
            'badge'            => $badge,
            'descricao'        => $descricao,
            'ver_dashboard'    => $ver_dashboard,
            'ver_clientes'     => $ver_clientes,
            'ver_categorias'   => $ver_categorias,
            'ver_produtos'     => $ver_produtos,
            'ver_pedidos'      => $ver_pedidos,
            'ver_admin'        => $ver_admin,
            'ver_curriculos'   => $ver_curriculos,
            'ver_trabalhos'    => $ver_trabalhos,
            'ver_cupons'       => $ver_cupons,
            'ver_relatorios'   => $ver_relatorios,
            'ver_customizacao' => $ver_customizacao,
            'ver_usuarios'     => $ver_usuarios,
            'ver_configuracoes'=> $ver_configuracoes,
            'ver_marketing'    => $ver_marketing,
            'ver_reviews'      => $ver_reviews,
            'ver_auditoria'    => $ver_auditoria,
            'ver_reports'      => $ver_reports,
            'ver_chamados'     => $ver_chamados,
        ];
    }

    public function getAllRoles() {
        try {
            $roles = $this->repository->findAllRoles();
            return ['roles' => $roles];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar papeis: ' . $e->getMessage()];
        }
    }

    public function createRole(array $body, ?array $admin = null): array {
        try {
            $role = $this->validateRole($body);

            $created = $this->repository->createRole($role);        

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'criar', 'papel', $created['id'] ?? null, ['nome' => $role['nome_papel']]);
            http_response_code(201);

            return [
                'message' => "Papel '{$role['nome_papel']}' criado com sucesso",
                'role' => $created
            ];
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'PAPEL_JA_EXISTE') {
                http_response_code(409);
                return ['error' => "Já existe um papel com o nome '{$role['nome_papel']}'"];
            }

            http_response_code(500);
            return ['error' => 'Erro interno ao criar papel: ' . $e->getMessage()];
        }           
    }

    public function updateRole($id, array $body, ?array $admin = null): array {
        try {
            $role = $this->validateRole($body);

            $updated = $this->repository->updateRole($id, $role);

            if(!$updated) {
                http_response_code(404);
                return ['error' => "Não foi possível atualizar papel $id, verifique se o id é válido"];
            }

            http_response_code(200);

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'editar', 'papel', (int)$id, ['nome' => $role['nome_papel']]);
            return [
                'message' => "Papel '{$role['nome_papel']}' atualizado com sucesso",
                'role' => $role
            ];
        } catch (InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar papel: ' . $e->getMessage()];
        }           
    }

    public function deleteRole($id, ?array $admin = null): array {
        try {
            $deleted = $this->repository->deleteRole((int)$id);

            if(!$deleted) {
                http_response_code(404);
                return ['error' => "Não foi possível remover papel $id, verifique se o id é válido"];
            }

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'papel', (int)$id);
            http_response_code(200);
            return ['message' => "Papel $id removido"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover papel: ' . $e->getMessage()];
        }
    }
}
