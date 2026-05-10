<?php

class AdminCategoryService {
    public function getAllCategories() {
        return ['message' => 'Listando todas as categorias (admin)'];
    }

    public function createCategory() {
        return ['message' => 'Categoria criada com sucesso'];
    }

    public function updateCategory($id) {
        return ['message' => "Categoria $id atualizada"];
    }

    public function deleteCategory($id) {
        return ['message' => "Categoria $id removida"];
    }
}
