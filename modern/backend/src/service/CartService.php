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

    public function addItem(array $body) {
        $produto_id = $body['produto_id'];
        $quantidade = $body['quantidade'];
        $usuario_id = $body['usuario_id'];

        $produto = $this->cartRepository->findProdutoById($produto_id);
        if (!$produto) {
            return ['error' => 'Produto não encontrado'];
        }

        $ativo = $this->cartRepository->findCarrinhoAtivo($usuario_id);
        if (!$ativo) {
            $carrinhoId = $this->cartRepository->createCarrinho($usuario_id);
        } else {
            $carrinhoId = $ativo['id'];
        }

        $this->cartRepository->addItem($carrinhoId, $produto['id'], $quantidade);
        return ['message' => "Produto {$produto['nome']} adicionado ao carrinho"];
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
