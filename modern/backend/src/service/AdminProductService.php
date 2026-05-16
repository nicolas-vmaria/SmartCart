<?php

require_once __DIR__ . '/../repository/AdminProductRepository.php';

class AdminProductService {
    private AdminProductRepository $repository;

    public function __construct() {
        $this->repository = new AdminProductRepository();
    }

    private function validateProduct(array $body): array {
        $nome         = isset($body['nome']) ? ucwords(trim(strtolower((string)$body['nome']))) : '';
        $categoria_id = $body['categoria_id'] ?? null;
        $preco        = $body['preco'] ?? null;
        $estoque      = $body['estoque'] ?? null;
        $descricao    = trim((string)($body['descricao'] ?? ''));
        $foto_url     = trim((string)($body['foto_url'] ?? ''));
        $statusRaw    = $body['status'] ?? null;
        $status       = ($statusRaw === true || $statusRaw === 'true' || $statusRaw === 1 || $statusRaw === '1') ? 1 : 0;

        if (!$nome || !$categoria_id || !$preco || $estoque === null || $estoque === '' || $statusRaw === null) {
            throw new InvalidArgumentException("Campos obrigatórios ausentes: nome, categoria_id, preco, estoque, status");
        }

        if (!is_numeric($preco) || $preco < 0) {
            throw new InvalidArgumentException("O campo preco deve ser um número positivo");
        }

        if (!is_numeric($estoque) || $estoque < 0) {
            throw new InvalidArgumentException("O campo estoque deve ser um número positivo");
        }

        $slugBase = strtr(strtolower($nome), [
            'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a',
            'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
            'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
            'ç'=>'c','ñ'=>'n',
        ]);
        $slug = trim(preg_replace('/[^a-z0-9]+/', '-', $slugBase), '-');
        
        return [
            'categoria_id' => $categoria_id,
            'nome'    => $nome,
            'slug'    => $slug, 
            'preco'   => $preco,
            'estoque'   => $estoque,
            'descricao' => $descricao,
            'foto_url'  => $foto_url,
            'status'    => $status,
        ];
    }



    public function getAllProducts() {
        try {
            $products = $this->repository->getAllProducts();
            return ['products' => $products];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar produtos: ' . $e->getMessage()];
        }
    }

    

    public function createProduct(array $body): array {
        try {
        $product = $this->validateProduct($body);

        $creted = $this->repository->createProduct($product);

        http_response_code(201);

        return [
            'message' => "Produto '{$product['nome']}' criado com sucesso",
            'product' => $creted
        ];

        } catch(InvalidArgumentException $e){
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'PRODUTO_JA_EXISTE') {
                http_response_code(409);
                return ['error' => "Já existe um produto com o nome ou slug"];
            }

            http_response_code(500);
            return ['error' => 'Erro interno ao criar produto: ' . $e->getMessage()];
        }
    }

    public function updateProduct(string $id, array $body): array {
        $id = (int)$id;

        try {
            $product = $this->validateProduct($body);

            $updated = $this->repository->updateProduct($id, $product);

            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Produto não encontrado'];
            }

            http_response_code(200);

            return [
                'message' => "Produto '{$product['nome']}' atualizado com sucesso",
                'product' => $product
            ];
        }catch(InvalidArgumentException $e){
            http_response_code(400);
            return ['error' => $e->getMessage()];
        } catch (RuntimeException $e) {
            if ($e->getMessage() === 'PRODUTO_JA_EXISTE') {
                http_response_code(409);
                return ['error' => "Já existe um produto com o nome ou slug"];
            }

            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar produto: ' . $e->getMessage()];
        }
    }


    public function deleteProduct($id) {
        $id = (int)$id;

        try {

            $deleted = $this->repository->deleteProduct($id);

            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Produto não encontrado'];
            }

            http_response_code(200);

            return ['message' => "Produto $id removido"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover produto: ' . $e->getMessage()];

        }
    }
}