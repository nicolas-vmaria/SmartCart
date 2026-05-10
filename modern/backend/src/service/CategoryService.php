<?php

class CategoryService {
    public function getAllCategories() {
        return ['message' => 'Listando todas as categorias'];
    }

    public function getCategoryBySlug($slug) {
        return ['message' => "Retornando categoria: $slug"];
    }
}
