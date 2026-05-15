<?php

require_once __DIR__ . '/../repository/AdminProductRepository.php';

class AdminProductService {
    private AdminProductRepository $repository;

    public function __construct() {
        $this->repository = new AdminProductRepository();
    }

    public function getAllProducts() {
        return $this->repository->getAllProducts();
    }

    public function createProduct(array $body): array {
        try {
        $nome         = isset($body['nome']) ? ucwords(trim(strtolower((string)$body['nome']))) : '';
        $categoria_id = $body['categoria_id'] ?? null;
        $preco        = $body['preco'] ?? null;
        $estoque      = $body['estoque'] ?? null;
        $descricao    = trim((string)($body['descricao'] ?? ''));
        $foto_url     = trim((string)($body['foto_url'] ?? ''));
        $statusRaw    = $body['status'] ?? null;
        $status       = ($statusRaw === true || $statusRaw === 'true' || $statusRaw === 1 || $statusRaw === '1') ? 1 : 0;

        if (!$nome || !$categoria_id || $preco === null || $estoque === null || !$descricao || !$foto_url) {
            throw new InvalidArgumentException("Todos os campos são obrigatórios.");
        }

        if (!is_numeric($preco) || $preco < 0) {
            throw new InvalidArgumentException("O campo preco deve ser um número positivo");
        }

        if (!is_numeric($estoque) || $estoque < 0) {
            throw new InvalidArgumentException("O campo estoque deve ser um número positivo");
        }

        $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $nome));

        $product = [
            "categoria_id" => $categoria_id,
            "nome" => $nome,
            "slug" => $slug,
            'preco'     => $preco,
            'estoque'   => $estoque,
            'descricao' => $descricao,
            'foto_url'  => $foto_url,
            'status'    => $status,
        ];

        $this->repository->createProduct($product);

        http_response_code(201);

        return [
            'message' => "Produto '$nome' criado com sucesso",
            'product' => $product
        ];
        } catch(InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
        if ($e->getMessage() === 'PRODUTO_JA_EXISTE') {
        http_response_code(409); 
        return ['error' => "Já existe um produto com o nome '{$product['nome']}'"];
    }

        http_response_code(500);
        return ['error' => 'Erro interno ao criar produto: ' . $e->getMessage()];
    }
    
    }

    public function updateProduct($id) {
        return ['message' => "Produto $id atualizado"];
    }

    public function deleteProduct($id) {
        return ['message' => "Produto $id removido"];
    }
}