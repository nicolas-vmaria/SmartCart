<?php

require_once __DIR__ . '/../repository/AdminCategoryRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';


class AdminCategoryService {
    private AdminCategoryRepository $repository;

    public function __construct(?AdminCategoryRepository $repo = null) {
        $this->repository = $repo ?? new AdminCategoryRepository();
    }

    public function getAllCategories(): array{
        try{

        $categories = $this->repository->getAllCategories();
        return $categories;
        } catch (Exception $e){
            http_response_code(500);
            return ['error' => 'Erro ao buscar categorias'];
        }
        
    }

    public function createCategory(array $body, ?array $admin = null): array {
        $nome = isset($body['nome']) ? trim((string)$body['nome']) : '';
        $descricao = isset($body['descricao']) ? trim((string)$body['descricao']) : '';

        if ($nome === '') {
            http_response_code(400);
            return ['error' => 'O campo nome é obrigatório'];
        }

        if ($descricao === '') {
            http_response_code(400);
            return ['error' => 'O campo descrição é obrigatório'];
            }

        try {
            $nome = isset($body['nome']) ? ucwords(trim(strtolower((string)$body['nome']))) : '';
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $nome));

            $this->repository->insertCategory([
                'nome' => $nome,
                'slug' => $slug,
                'descricao' => $descricao
            ]);

        } catch (Exception $e) {
            if ($e->getMessage() === 'CATEGORIA_JA_EXISTE') {
            http_response_code(409);
            return ['error' => "A categoria '$nome' já existe"];
        }
            http_response_code(500);
            return ['error' => 'Erro ao criar categoria'];
        }
        
        if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'criar', 'categoria', null, ['nome' => $nome]);
        return ['message' => "Categoria '$nome' criada com sucesso"];
    }

    public function updateCategory(string $id, array $body, ?array $admin = null): array {
    $id = (int) $id;

    if ($id <= 0) {
        http_response_code(400);
        return ['error' => 'ID inválido'];
    }

    $nome     = isset($body['nome'])     ? trim((string) $body['nome'])     : '';
    $descricao = isset($body['descricao']) ? trim((string) $body['descricao']) : '';

    if ($nome === '') {
        http_response_code(400);
        return ['error' => 'O campo nome é obrigatório'];
    }

    if ($descricao === '') {
        http_response_code(400);
        return ['error' => 'O campo descrição é obrigatório'];
    }

    try {
        $nome  = ucwords(strtolower($nome));
        $slug  = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $nome));

        $updated = $this->repository->updateCategory($id, [
            'nome'     => $nome,
            'slug'     => $slug,
            'descricao' => $descricao
        ]);

        if (!$updated) {
            http_response_code(404);
            return ['error' => 'Categoria não encontrada'];
        }

        http_response_code(200);

        if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'editar', 'categoria', $id, ['nome' => $nome]);
        return ['message' => "Categoria '$nome' atualizada com sucesso"];
    } catch (Exception $e) {
        if ($e->getMessage() === 'CATEGORIA_JA_EXISTE') {
            http_response_code(409);
            return ['error' => "Já existe uma categoria com o nome '$nome'"];
        }
        http_response_code(500);
        return ['error' => 'Erro ao atualizar categoria'];
    }
}

    public function deleteCategory(string $id, ?array $admin = null): array {
        $id = (int) $id;

        if($id <= 0 ){
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }
        try{
            $deleted = $this->repository->deleteCategory($id);

            if(!$deleted){
                http_response_code(404);
                return ['error' => 'Categoria não encontrada'];
            }
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'categoria', (int)$id);
            return ['message' => 'Categoria removida com sucesso'];
        }catch(Exception $e){
            http_response_code(500);
            return ['error' => 'Erro ao remover categoria'];
        }
    }
}
