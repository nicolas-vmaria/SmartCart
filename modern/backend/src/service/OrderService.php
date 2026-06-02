<?php

require_once __DIR__ . '/../repository/OrderRepository.php';
require_once __DIR__ . '/NotificationService.php';

class OrderService {
    private OrderRepository $repo;

    private const FRETE_GRATIS_MINIMO = 500.00;

    private const FRETE_POR_UF = [
        'SP' => 15.90, 'RJ' => 15.90, 'MG' => 15.90, 'ES' => 15.90,
        'PR' => 19.90, 'SC' => 19.90, 'RS' => 19.90,
        'GO' => 24.90, 'MT' => 24.90, 'MS' => 24.90, 'DF' => 24.90,
        'BA' => 34.90, 'SE' => 34.90, 'AL' => 34.90, 'PE' => 34.90, 'PB' => 34.90,
        'RN' => 34.90, 'CE' => 34.90, 'PI' => 34.90, 'MA' => 34.90,
        'PA' => 44.90, 'AM' => 44.90, 'RO' => 44.90, 'RR' => 44.90,
        'AP' => 44.90, 'AC' => 44.90, 'TO' => 44.90,
    ];

    private function calcularFrete(string $uf, float $subtotalComDesconto): float {
        if ($subtotalComDesconto >= self::FRETE_GRATIS_MINIMO) return 0.0;
        return self::FRETE_POR_UF[$uf] ?? 29.90;
    }

    public function __construct() {
        $this->repo = new OrderRepository();
    }

    public function getUserOrders(int $usuario_id): array {
        try {
            $orders = $this->repo->getUserOrders($usuario_id);
            return ['pedidos' => $orders];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedidos'];
        }
    }

    public function getOrderById(int $id, int $usuario_id): array {
        try {
            $order = $this->repo->getOrderById($id);

            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }

            if ($order['usuario_id'] !== $usuario_id) {
                http_response_code(403);
                return ['error' => 'Acesso negado'];
            }

            $order['itens'] = $this->repo->getOrderItems($id);
            return ['pedido' => $order];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedido'];
        }
    }

    public function createOrder(int $usuario_id, array $body): array {
        $camposObrigatorios = [
            'metodo_pagamento', 'cep', 'rua', 'numero', 'bairro', 'cidade', 'estado'
        ];

        foreach ($camposObrigatorios as $campo) {
            if (empty($body[$campo])) {
                http_response_code(400);
                return ['error' => "Campo obrigatório ausente: {$campo}"];
            }
        }

        $metodosValidos = ['pix', 'cartao_credito'];
        if (!in_array($body['metodo_pagamento'], $metodosValidos)) {
            http_response_code(400);
            return ['error' => 'Método de pagamento inválido'];
        }

        // Busca carrinho ativo
        $carrinho = $this->repo->getCarrinhoAtivo($usuario_id);
        if (!$carrinho) {
            http_response_code(400);
            return ['error' => 'Nenhum carrinho ativo encontrado'];
        }

        $itens = $this->repo->getCarrinhoItens($carrinho['id']);
        if (empty($itens)) {
            http_response_code(400);
            return ['error' => 'Carrinho vazio'];
        }

        // Valida estoque e calcula subtotal
        foreach ($itens as $item) {
            if (!$item['status']) {
                http_response_code(400);
                return ['error' => "Produto \"{$item['nome']}\" está indisponível"];
            }
            if ($item['estoque'] < $item['quantidade']) {
                http_response_code(400);
                return ['error' => "Estoque insuficiente para \"{$item['nome']}\""];
            }
        }

        $subtotal = array_reduce($itens, fn($acc, $item) =>
            $acc + ($item['preco'] * $item['quantidade']), 0.0
        );

        // Cupom
        $cupom_id  = null;
        $desconto  = 0.0;

        if (!empty($body['codigo_cupom'])) {
            $cupom = $this->repo->findCupom($body['codigo_cupom']);

            if (!$cupom) {
                http_response_code(400);
                return ['error' => 'Cupom não encontrado'];
            }
            if (!$cupom['ativo']) {
                http_response_code(400);
                return ['error' => 'Cupom inativo'];
            }
            if (strtotime($cupom['data_validade']) < strtotime('today')) {
                http_response_code(400);
                return ['error' => 'Cupom expirado'];
            }
            if ($cupom['max_usos'] !== null && $cupom['quant_usos'] >= $cupom['max_usos']) {
                http_response_code(400);
                return ['error' => 'Cupom esgotado'];
            }

            if ($this->repo->hasUserUsed($cupom['id'], $usuario_id)) {
                http_response_code(400);
                return ['error' => 'Você já utilizou este cupom'];
            }

            $cupom_id = $cupom['id'];
            $desconto = $cupom['tipo_desconto'] === 'percentual'
                ? round($subtotal * ($cupom['desconto'] / 100), 2)
                : $cupom['desconto'];

            $desconto = min($desconto, $subtotal);
        }

        $subtotalComDesconto = $subtotal - $desconto;
        $frete  = $this->calcularFrete($body['estado'], $subtotalComDesconto);
        $total  = $subtotalComDesconto + $frete;

        // Simula pagamento — sempre aprovado
        $transacao_id = 'SIM-' . strtoupper(substr(md5(uniqid((string) $usuario_id, true)), 0, 12));

        $payload = [
            'usuario_id'        => $usuario_id,
            'carrinho_id'       => $carrinho['id'],
            'id_cupom'          => $cupom_id,
            'metodo_pagamento'  => $body['metodo_pagamento'],
            'transacao_id'      => $transacao_id,
            'status'            => 'aguardando',
            'total'             => $total,
            'cep'               => preg_replace('/\D/', '', $body['cep']),
            'rua'               => $body['rua'],
            'numero'            => $body['numero'],
            'complemento'       => $body['complemento'] ?? null,
            'bairro'            => $body['bairro'],
            'cidade'            => $body['cidade'],
            'estado'            => $body['estado'],
        ];

        try {
            $pedido_id = $this->repo->createOrder($payload, $itens, $cupom_id);
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao criar pedido'];
        }

        $pedido = $this->repo->getOrderById($pedido_id);
        $pedido['itens'] = $this->repo->getOrderItems($pedido_id);

        NotificationService::notifyNewOrder($pedido_id, (float)$total, $body['metodo_pagamento']);

        return [
            'message' => 'Pedido criado com sucesso',
            'pedido'  => $pedido,
        ];
    }

    public function updateStatus(int $id, array $body): array {
        $statusValidos = ['aguardando', 'pago', 'enviado', 'entregue', 'cancelado'];

        if (empty($body['status']) || !in_array($body['status'], $statusValidos)) {
            http_response_code(400);
            return ['error' => 'Status inválido'];
        }

        try {
            $updated = $this->repo->updateStatus($id, $body['status'], $body['codigo_rastreio'] ?? null);
            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            return ['message' => 'Status atualizado com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao atualizar status'];
        }
    }

    public function cancelOrder(int $id, int $usuario_id): array {
        try {
            $order = $this->repo->getOrderById($id);

            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            if ($order['usuario_id'] !== $usuario_id) {
                http_response_code(403);
                return ['error' => 'Acesso negado'];
            }
            if (in_array($order['status'], ['enviado', 'entregue', 'cancelado'])) {
                http_response_code(400);
                return ['error' => 'Pedido não pode ser cancelado'];
            }

            $this->repo->updateStatus($id, 'cancelado', null);
            return ['message' => 'Pedido cancelado com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao cancelar pedido'];
        }
    }

    public function getOrderReviewItems(int $orderId, int $userId): array {
        try {
            $order = $this->repo->getOrderById($orderId);

            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            if ((int) $order['usuario_id'] !== $userId) {
                http_response_code(403);
                return ['error' => 'Acesso negado'];
            }
            if ($order['status'] !== 'entregue') {
                http_response_code(400);
                return ['error' => 'Pedido ainda não foi entregue'];
            }

            $items = $this->repo->getOrderReviewItems($orderId, $userId);
            return ['items' => $items];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar itens para avaliação'];
        }
    }

    public function getTracking(int $id, int $usuario_id): array {
        try {
            $order = $this->repo->getOrderById($id);

            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            if ($order['usuario_id'] !== $usuario_id) {
                http_response_code(403);
                return ['error' => 'Acesso negado'];
            }

            return [
                'pedido_id'        => $id,
                'status'           => $order['status'],
                'codigo_rastreio'  => $order['codigo_rastreio'],
                'created_at'       => $order['created_at'],
            ];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar rastreamento'];
        }
    }
}