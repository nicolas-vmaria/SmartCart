<?php

class AdminProductService {
    public function getAllProducts() {
        return ['message' => 'Listando todos os produtos (admin)'];
    }

    public function createProduct() {
        return ['message' => 'Produto criado com sucesso'];
    }

    public function updateProduct($id) {
        return ['message' => "Produto $id atualizado"];
    }

    public function deleteProduct($id) {
        return ['message' => "Produto $id removido"];
    }
}
