<?php

require_once __DIR__ . '/../repository/AdminReviewRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';

class AdminReviewService {
    private AdminReviewRepository $repo;

    public function __construct(?AdminReviewRepository $repo = null) {
        $this->repo = $repo ?? new AdminReviewRepository();
    }

    public function getAll(?string $search, ?int $nota): array {
        try {
            $stats   = $this->repo->getStats();
            $reviews = $this->repo->getAllReviews($search, $nota);
            return ['stats' => $stats, 'reviews' => $reviews];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar reviews'];
        }
    }

    public function delete(int $id, ?array $admin = null): array {
        try {
            $deleted = $this->repo->deleteReview($id);
            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Review não encontrado'];
            }
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'review', $id);
            return ['message' => 'Review excluído com sucesso'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao excluir review'];
        }
    }

    public function bulkDelete(array $ids, ?array $admin = null): array {
        if (empty($ids)) {
            http_response_code(400);
            return ['error' => 'Nenhum ID informado'];
        }
        try {
            $count = $this->repo->bulkDeleteReviews($ids);
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar_em_massa', 'review', null, ['quantidade' => $count]);
            return ['message' => "{$count} review(s) excluído(s)"];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao excluir reviews'];
        }
    }

    public function getPalavras(): array {
        try {
            return ['palavras' => $this->repo->getPalavrasProibidas()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar palavras proibidas'];
        }
    }

    public function addPalavra(string $palavra, ?array $admin = null): array {
        $palavra = trim($palavra);
        if (!$palavra) {
            http_response_code(400);
            return ['error' => 'Palavra não pode ser vazia'];
        }
        try {
            $item = $this->repo->addPalavraProibida($palavra);
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'adicionar_palavra', 'review', null, ['palavra' => $palavra]);
            return ['message' => 'Palavra adicionada', 'palavra' => $item];
        } catch (InvalidArgumentException $e) {
            http_response_code(409);
            return ['error' => 'Palavra já existe na lista'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao adicionar palavra'];
        }
    }

    public function deletePalavra(int $id, ?array $admin = null): array {
        try {
            $deleted = $this->repo->deletePalavraProibida($id);
            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Palavra não encontrada'];
            }
            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar_palavra', 'review', $id);
            return ['message' => 'Palavra removida'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao remover palavra'];
        }
    }
}
