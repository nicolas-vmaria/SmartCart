<?php

require_once __DIR__ . '/../repositories/AdminProductRepository.php';

class AdminProductService {
    private AdminProductRepository $repository;

    public function __construct() {
        $this->repository = new AdminProductRepository();
    }

    public function getAllProducts() {
        return ['message' => 'Listando todos os produtos (admin)'];
    }

    public function createProduct(array $body): array {
        $camposObrigatorios = ['nome', 'preco', 'estoque', 'status'];

        foreach ($camposObrigatorios as $campo) {
            if (empty($body[$campo]) && $body[$campo] !== 0) {
                throw new InvalidArgumentException("Campo obrigatório ausente: $campo");
            }
        }

        if (!is_numeric($body['preco']) || $body['preco'] < 0) {
            throw new InvalidArgumentException("Preço inválido.");
        }

        if (!is_numeric($body['estoque']) || $body['estoque'] < 0 || !is_int((int)$body['estoque'])) {
            throw new InvalidArgumentException("Estoque inválido.");
        }

        $statusPermitidos = ['ativo', 'inativo'];
        if (!in_array($body['status'], $statusPermitidos)) {
            throw new InvalidArgumentException("Status inválido. Use 'ativo' ou 'inativo'.");
        }

        if (!empty($body['foto_url']) && !filter_var($body['foto_url'], FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException("URL da foto inválida.");
        }

        $product = [
            'nome'      => trim($body['nome']),
            'preco'     => (float) $body['preco'],
            'estoque'   => (int) $body['estoque'],
            'descricao' => isset($body['descricao']) ? trim($body['descricao']) : null,
            'foto_url'  => isset($body['foto_url']) ? trim($body['foto_url']) : null,
            'status'    => $body['status'],
        ];

        try{
            $this->repository->createProduct($product);
        }catch (RuntimeException $e){
            throw new RuntimeException("Erro ao criar produto: " . $e->getMessage(), 0, $e);
        }
        
        return [
            "produto" => [
                "nome" => $product["nome"],
                'preco'     => $product['preco'],
                'estoque'   => $product['estoque'],
                'descricao' => $product['descricao'],
                'foto_url'  => $product['foto_url'],
                'status'    => $product['status']
            ]
            ];
    }

    public function updateProduct($id) {
        return ['message' => "Produto $id atualizado"];
    }

    public function deleteProduct($id) {
        return ['message' => "Produto $id removido"];
    }
}