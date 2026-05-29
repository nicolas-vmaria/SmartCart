<?php

require_once __DIR__ . '/../repository/CompraJuntoRepository.php';

class CompraJuntoService {
    private CompraJuntoRepository $repository;

    public function __construct() {
        $this->repository = new CompraJuntoRepository();
    }

    public function getAll(): array {
        return ['pares' => $this->repository->findAll()];
    }

    public function getByProduto(int $id): array {
        $produto = $this->repository->findByProduto($id);
        if (!$produto) {
            return ['produto' => null];
        }
        return ['produto' => $produto];
    }

    public function set(array $body): array {
        $produtoId  = isset($body['produto_id'])  ? (int)$body['produto_id']  : 0;
        $sugeridoId = isset($body['sugerido_id']) ? (int)$body['sugerido_id'] : 0;

        if (!$produtoId || !$sugeridoId) {
            http_response_code(400);
            return ['error' => 'produto_id e sugerido_id são obrigatórios'];
        }

        if ($produtoId === $sugeridoId) {
            http_response_code(400);
            return ['error' => 'Um produto não pode ser sugerido com ele mesmo'];
        }

        try {
            $this->repository->set($produtoId, $sugeridoId);
            return ['message' => 'Par salvo com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao salvar: ' . $e->getMessage()];
        }
    }

    public function delete(int $produtoId): array {
        $deleted = $this->repository->delete($produtoId);
        if (!$deleted) {
            http_response_code(404);
            return ['error' => 'Par não encontrado'];
        }
        return ['message' => 'Par removido'];
    }
}
