<?php

require_once __DIR__ . '/../core/connection.php';

class OrderRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function getUserOrders(int $usuario_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    p.id,
                    p.status,
                    p.metodo_pagamento,
                    p.total,
                    p.created_at,
                    COUNT(ip.id) AS qtd_itens
                FROM Pedidos p
                LEFT JOIN Itens_Pedido ip ON ip.pedido_id = p.id
                WHERE p.usuario_id = :usuario_id
                GROUP BY p.id
                ORDER BY p.created_at DESC
            ");
            $stmt->execute([':usuario_id' => $usuario_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_USER_ORDERS', 0, $e);
        }
    }

    public function getOrderById(int $id): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    p.id,
                    p.usuario_id,
                    p.carrinho_id,
                    p.id_cupom,
                    p.metodo_pagamento,
                    p.transacao_id,
                    p.status,
                    p.total,
                    p.cep,
                    p.rua,
                    p.numero,
                    p.complemento,
                    p.bairro,
                    p.cidade,
                    p.estado,
                    p.codigo_rastreio,
                    p.created_at,
                    c.codigo AS cupom_codigo,
                    c.tipo_desconto,
                    c.desconto AS cupom_desconto
                FROM Pedidos p
                LEFT JOIN Cupons c ON c.id = p.id_cupom
                WHERE p.id = :id
            ");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ORDER_BY_ID', 0, $e);
        }
    }

    public function getOrderItems(int $pedido_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    ip.id,
                    ip.produto_id,
                    ip.quantidade,
                    ip.preco_unitario_historico,
                    ip.subtotal,
                    pr.nome,
                    pr.slug,
                    pr.foto_url
                FROM Itens_Pedido ip
                JOIN Produtos pr ON pr.id = ip.produto_id
                WHERE ip.pedido_id = :pedido_id
            ");
            $stmt->execute([':pedido_id' => $pedido_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ORDER_ITEMS', 0, $e);
        }
    }

    public function getCarrinhoAtivo(int $usuario_id): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT id FROM Carrinhos
                WHERE usuario_id = :usuario_id AND status = 'ativo'
                LIMIT 1
            ");
            $stmt->execute([':usuario_id' => $usuario_id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_CARRINHO_ATIVO', 0, $e);
        }
    }

    public function getCarrinhoItens(int $carrinho_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    ic.id,
                    ic.produto_id,
                    ic.quantidade,
                    p.nome,
                    p.preco,
                    p.estoque,
                    p.status,
                    p.foto_url
                FROM Itens_Carrinho ic
                JOIN Produtos p ON p.id = ic.produto_id
                WHERE ic.carrinho_id = :carrinho_id
            ");
            $stmt->execute([':carrinho_id' => $carrinho_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_CARRINHO_ITENS', 0, $e);
        }
    }

    public function hasUserUsed(int $cupom_id, int $usuario_id): bool {
        try {
            $stmt = $this->db->prepare("
                SELECT 1 FROM CuponsUsoUsuarios
                WHERE cupom_id = :cupom_id AND usuario_id = :usuario_id
                LIMIT 1
            ");
            $stmt->execute([':cupom_id' => $cupom_id, ':usuario_id' => $usuario_id]);
            return $stmt->fetchColumn() !== false;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_VERIFICAR_USO_CUPOM', 0, $e);
        }
    }

    public function findCupom(string $codigo): ?array {
        try {
            $stmt = $this->db->prepare("
                SELECT id, codigo, tipo_desconto, desconto, data_validade, ativo, quant_usos, max_usos
                FROM Cupons
                WHERE codigo = :codigo
                LIMIT 1
            ");
            $stmt->execute([':codigo' => $codigo]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_FIND_CUPOM', 0, $e);
        }
    }

    public function createOrder(array $payload, array $itens, ?int $cupom_id): int {
        try {
            $this->db->beginTransaction();

            // Insere o pedido
            $stmt = $this->db->prepare("
                INSERT INTO Pedidos (
                    usuario_id, carrinho_id, id_cupom, metodo_pagamento,
                    transacao_id, status, total,
                    cep, rua, numero, complemento, bairro, cidade, estado
                ) VALUES (
                    :usuario_id, :carrinho_id, :id_cupom, :metodo_pagamento,
                    :transacao_id, :status, :total,
                    :cep, :rua, :numero, :complemento, :bairro, :cidade, :estado
                )
            ");
            $stmt->execute([
                ':usuario_id'       => $payload['usuario_id'],
                ':carrinho_id'      => $payload['carrinho_id'],
                ':id_cupom'         => $payload['id_cupom'],
                ':metodo_pagamento' => $payload['metodo_pagamento'],
                ':transacao_id'     => $payload['transacao_id'],
                ':status'           => $payload['status'],
                ':total'            => $payload['total'],
                ':cep'              => $payload['cep'],
                ':rua'              => $payload['rua'],
                ':numero'           => $payload['numero'],
                ':complemento'      => $payload['complemento'],
                ':bairro'           => $payload['bairro'],
                ':cidade'           => $payload['cidade'],
                ':estado'           => $payload['estado'],
            ]);

            $pedido_id = (int) $this->db->lastInsertId();

            // Insere itens do pedido e decrementa estoque
            $stmtItem = $this->db->prepare("
                INSERT INTO Itens_Pedido (pedido_id, produto_id, quantidade, preco_unitario_historico, subtotal)
                VALUES (:pedido_id, :produto_id, :quantidade, :preco_unitario, :subtotal)
            ");
            $stmtEstoque = $this->db->prepare("
                UPDATE Produtos SET estoque = estoque - :quantidade WHERE id = :id
            ");

            foreach ($itens as $item) {
                $subtotal = $item['preco'] * $item['quantidade'];
                $stmtItem->execute([
                    ':pedido_id'      => $pedido_id,
                    ':produto_id'     => $item['produto_id'],
                    ':quantidade'     => $item['quantidade'],
                    ':preco_unitario' => $item['preco'],
                    ':subtotal'       => $subtotal,
                ]);
                $stmtEstoque->execute([
                    ':quantidade' => $item['quantidade'],
                    ':id'         => $item['produto_id'],
                ]);
            }

            // Marca carrinho como convertido
            $stmtCarrinho = $this->db->prepare("
                UPDATE Carrinhos SET status = 'convertido' WHERE id = :id
            ");
            $stmtCarrinho->execute([':id' => $payload['carrinho_id']]);

            // Incrementa uso do cupom e registra uso por usuário
            if ($cupom_id !== null) {
                $stmtCupom = $this->db->prepare("
                    UPDATE Cupons SET quant_usos = quant_usos + 1 WHERE id = :id
                ");
                $stmtCupom->execute([':id' => $cupom_id]);

                $stmtUso = $this->db->prepare("
                    INSERT IGNORE INTO CuponsUsoUsuarios (cupom_id, usuario_id)
                    VALUES (:cupom_id, :usuario_id)
                ");
                $stmtUso->execute([
                    ':cupom_id'   => $cupom_id,
                    ':usuario_id' => $payload['usuario_id'],
                ]);
            }

            $this->db->commit();
            return $pedido_id;
        } catch (PDOException $e) {
            $this->db->rollBack();
            throw new RuntimeException('ERRO_CREATE_ORDER', 0, $e);
        }
    }

    public function getOrderReviewItems(int $pedido_id, int $user_id): array {
        try {
            $stmt = $this->db->prepare("
                SELECT
                    ip.produto_id,
                    p.nome,
                    p.foto_url,
                    ip.quantidade,
                    r.id        AS review_id,
                    r.nota,
                    r.descricao AS review_descricao
                FROM Itens_Pedido ip
                JOIN Produtos p ON p.id = ip.produto_id
                LEFT JOIN Review r ON r.produto_id = ip.produto_id AND r.user_id = :user_id
                WHERE ip.pedido_id = :pedido_id
            ");
            $stmt->execute([':pedido_id' => $pedido_id, ':user_id' => $user_id]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_GET_ORDER_REVIEW_ITEMS', 0, $e);
        }
    }

    public function updateStatus(int $id, string $status, ?string $codigo_rastreio): bool {
        try {
            $stmt = $this->db->prepare("
                UPDATE Pedidos
                SET status = :status,
                    codigo_rastreio = COALESCE(:codigo_rastreio, codigo_rastreio)
                WHERE id = :id
            ");
            $stmt->execute([
                ':status'          => $status,
                ':codigo_rastreio' => $codigo_rastreio,
                ':id'              => $id,
            ]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new RuntimeException('ERRO_UPDATE_ORDER_STATUS', 0, $e);
        }
    }
}