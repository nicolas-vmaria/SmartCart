<?php

require_once __DIR__ . '/../repository/AdminCategoryRepository.php';


class AdminCategoryService {
    private AdminCategoryRepository $repository;

    public function __construct() {
        $this->repository = new AdminCategoryRepository();
    }

    public function getAllCategories() {
        return ['message' => 'Listando todas as categorias (admin)'];
    }

    public function createCategory(array $body): array {
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

            $this->repository->insertCategory([
                'nome' => $nome,
                'descricao' => $descricao
            ]);

        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao criar categoria: ' . $e->getMessage()];
        }


        return ['message' => "Categoria '$nome' criada com sucesso"];
    }

    public function updateCategory($id) {
        return ['message' => "Categoria $id atualizada"];
    }

    public function deleteCategory($id) {
        return ['message' => "Categoria $id removida"];
    }
}
