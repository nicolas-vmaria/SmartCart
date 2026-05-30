<?php

require_once __DIR__ . '/../repository/CandidacyRepository.php';

class CandidacyService {
    private CandidacyRepository $repository;

    public function __construct() {
        $this->repository = new CandidacyRepository();
    }

    public function getAllTrabalhos(): array {
        try {
            return ['message' => 'Retornando vagas disponíveis', 'trabalhos' => $this->repository->getAllActive()];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar vagas: ' . $e->getMessage()];
        }
    }

    public function getTrabalhoBySlug(string $slug): array {
        try {
            $trabalho = is_numeric($slug)
                ? $this->repository->findById((int)$slug)
                : $this->repository->findBySlug($slug);

            if (!$trabalho) {
                http_response_code(404);
                return ['error' => "Vaga '$slug' não encontrada"];
            }

            return ['message' => 'Vaga encontrada', 'trabalho' => $trabalho];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar vaga: ' . $e->getMessage()];
        }
    }

    public function candidatar(string $id, array $body): array {
        $idInt = (int)$id;
        if ($idInt <= 0) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        $nome           = trim((string)($body['nome'] ?? ''));
        $email          = trim((string)($body['email'] ?? ''));
        $tel            = trim((string)($body['tel'] ?? ''));
        $portfolio_url  = trim((string)($body['portfolio_url'] ?? ''));
        $curriculo_url  = trim((string)($body['curriculo_url'] ?? ''));
        $carta_apresent = trim((string)($body['carta_apresent'] ?? ''));

        if ($nome === '') {
            http_response_code(400);
            return ['error' => 'O campo nome é obrigatório'];
        }
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido ou não informado'];
        }

        try {
            $trabalho = $this->repository->findById($idInt);

            if (!$trabalho) {
                http_response_code(404);
                return ['error' => 'Vaga não encontrada'];
            }

            if (!(bool)$trabalho['ativa']) {
                http_response_code(409);
                return ['error' => 'Esta vaga não está mais disponível'];
            }

            $this->repository->createApplication([
                'trabalho_id'    => $idInt,
                'nome'           => $nome,
                'email'          => $email,
                'tel'            => $tel,
                'portfolio_url'  => $portfolio_url,
                'curriculo_url'  => $curriculo_url,
                'carta_apresent' => $carta_apresent,
            ]);

            http_response_code(201);
            return ['message' => 'Candidatura enviada com sucesso'];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao enviar candidatura: ' . $e->getMessage()];
        }
    }

    public function candidaturaEspontanea(array $body): array {
        $nome            = trim((string)($body['nome'] ?? ''));
        $email           = trim((string)($body['email'] ?? ''));
        $tel             = trim((string)($body['tel'] ?? ''));
        $portfolio_url   = trim((string)($body['portfolio_url'] ?? ''));
        $curriculo_url   = trim((string)($body['curriculo_url'] ?? ''));
        $carta_apresent  = trim((string)($body['carta_apresent'] ?? ''));
        $area_interesse  = trim((string)($body['area_interesse'] ?? ''));
 
        if ($nome === '') {
            http_response_code(400);
            return ['error' => 'O campo nome é obrigatório'];
        }
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['error' => 'E-mail inválido ou não informado'];
        }
 
        try {
            $this->repository->createEspontanea([
                'nome'           => $nome,
                'email'          => $email,
                'tel'            => $tel,
                'portfolio_url'  => $portfolio_url,
                'curriculo_url'  => $curriculo_url,
                'carta_apresent' => $carta_apresent,
                'area_interesse' => $area_interesse,
            ]);
 
            http_response_code(201);
            return ['message' => 'Currículo enviado com sucesso'];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao enviar currículo: ' . $e->getMessage()];
        }
    }
}