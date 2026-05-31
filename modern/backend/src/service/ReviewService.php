<?php

require_once __DIR__ . '/../repository/ReviewRepository.php';

class ReviewService {
    private ReviewRepository $repository;

    public function __construct() {
        $this->repository = new ReviewRepository();
    }


    public function getProductReviews($productId) {
        try {
            $produto = $this->repository->findProdutoById($productId);

            if (!$produto) {
                http_response_code(404);
                return ['error' => 'Produto não encontrado'];
            }

            $reviwes = $this->repository->getProductReviews($productId);

            if (empty($reviwes)) {
                return [
                'message' => 'Nenhum review encontrado',
                'reviews' => []];
            }

            return ['reviews' => $reviwes];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar reviews'];
        }
    }

    public function createReview(array $body) {
        $nota = (int)$body['nota'];
        $descricao = $body['descricao'] ?? null;
        $qtd_likes = isset($body['qtd_likes']) ? (int)$body['qtd_likes'] : 0;

        if (!$descricao || !$nota || !isset($body['user_id']) || !isset($body['produto_id'])) {
            http_response_code(400);
            return ['error' => 'Campos obrigatórios não informados'];
        }

        if($nota < 1 || $nota > 5) {
            http_response_code(400);
            return ['error' => 'Nota inválida'];
        }

        $palavras = $this->repository->getPalavrasProibidas();
        foreach ($palavras as $palavra) {
            if (stripos($descricao, $palavra) !== false) {
                http_response_code(400);
                return ['error' => 'Seu comentário contém conteúdo inadequado.'];
            }
        }

        try {
            $review = $this->repository->createReview([
                'user_id'     => $body['user_id'],
                'produto_id'  => $body['produto_id'],
                'nota'        => $nota,
                'descricao'   => $descricao,
                'qtd_likes'   => $qtd_likes,
            ]);
            return [

                'message' => 'Review criada com sucesso',
                'review' => $review

                ];
        }catch (InvalidArgumentException $e) {
            http_response_code(400);
            return ['error' => 'Review já existe'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao criar review'];
        }
        
    }

    public function markHelpful(int $id) {
    try {
        $updated = $this->repository->markHelpful($id);

        if (!$updated) {
            http_response_code(404);
            return ['error' => 'Review não encontrada'];
        }

        return ['message' => 'Review marcada como útil'];
    } catch (Exception $e) {
        http_response_code(500);
        return ['error' => 'Erro ao marcar review como útil'];
    }
}
}
