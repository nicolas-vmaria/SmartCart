<?php

require_once __DIR__ . '/../repository/CartRepository.php';

class CartService {
    private CartRepository $cartRepository;

    public function __construct() {
        $this->cartRepository = new CartRepository();
    }

    public function getCart(int $usuario_id) {
        try {
            $cart = $this->cartRepository->getCart($usuario_id);

            if(empty($cart)) {
                return ['message' => 'Carrinho vazio'];
            }

            return ['carrinho' => $cart];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao recuperar o carrinho'];
        }
    }

    public function addItem(array $body) {
    if(!isset($body['produto_id']) || !isset($body['quantidade']) || !isset($body['usuario_id'])) {
        http_response_code(400);
        return ['error' => 'Campos obrigatórios não informados'];
    }

    $produto_id = (int)$body['produto_id'];
    $quantidade = (int)$body['quantidade'];
    $usuario_id = (int)$body['usuario_id'];

    // 1. valida produto primeiro
    $produto = $this->cartRepository->findProdutoById($produto_id);
    if (!$produto) {
        http_response_code(404);
        return ['error' => 'Produto não encontrado'];
    }

    if (!$produto['status']) {
        http_response_code(400);
        return ['error' => 'Produto indisponível'];
    }

    if ($produto['estoque'] < $quantidade) {
        http_response_code(400);
        return ['error' => 'Quantidade insuficiente'];
    }

    // 2. só depois busca ou cria carrinho
    $ativo = $this->cartRepository->findCarrinhoAtivo($usuario_id);
    if (!$ativo) {
        $carrinhoId = $this->cartRepository->createCarrinho($usuario_id);
    } else {
        $carrinhoId = $ativo['id'];
    }

    try {
        $this->cartRepository->addItem($carrinhoId, $produto_id, $quantidade);
        return ['message' => "Produto {$produto['nome']} adicionado ao carrinho"];
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Erro ao adicionar item ao carrinho'];
    }
}

    public function updateItem(int $item_id, array $body) {
        $quantidade = $body['quantidade'] ?? null;

        if (!$quantidade || $quantidade < 1) {
            http_response_code(400);
            return ['error' => 'Quantidade inválida'];
        }

        try {
            $updated = $this->cartRepository->updateItem($item_id, (int)$quantidade);
            if (!$updated) {
                http_response_code(400);
                return ['error' => 'Quantidade insuficiente ou item não encontrado'];
            }
            return ['message' => 'Item atualizado com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao atualizar o item'];
        }
    }

    public function removeItem(int $item_id) {
        $item = $this->cartRepository->findItemById($item_id);
        if (!$item) {
            http_response_code(404);
            return ['error' => 'Item não encontrado'];
        }

        try {
            $this->cartRepository->removeItem($item_id);
            return ['message' => "Item removido com sucesso"];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao remover o item'];
        }
    }

    public function clearCart(int $usuario_id) {
        try {
            $this->cartRepository->clearCart($usuario_id);
            return ['message' => 'Carrinho limpo com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao limpar o carrinho'];
        }
    }
}
