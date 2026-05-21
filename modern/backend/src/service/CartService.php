<?php

require_once __DIR__ . '/../repository/CartRepository.php';

class CartService {
    private CartRepository $cartRepository;

    public function __construct() {
        $this->cartRepository = new CartRepository();
    }

    public function getCart() {
        return ['message' => 'Retornando carrinho do usuário'];
    }

    public function addItem() {
        return ['message' => 'Item adicionado ao carrinho'];
    }

    public function updateItem($id) {
        return ['message' => "Item $id atualizado no carrinho"];
    }

    public function removeItem($id) {
        return ['message' => "Item $id removido do carrinho"];
    }

    public function clearCart() {
        return ['message' => 'Carrinho limpo'];
    }
}
