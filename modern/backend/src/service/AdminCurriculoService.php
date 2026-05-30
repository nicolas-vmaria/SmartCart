<?php

require_once __DIR__ . '/../repository/AdminCurriculosRepository.php';

class AdminCurriculoService {
    private AdminCurriculosRepository $repository;

    private const ALLOWED_STATUS = ['novo', 'em_analise', 'aprovado', 'reprovado'];

    public function __construct() {
        $this->repository = new AdminCurriculosRepository();
    }

    private function validarId(int $id): bool {
        return $id > 0;
    }

    public function getAllCurriculos(?string $search, ?string $status): array {
        if ($status !== null && !in_array($status, self::ALLOWED_STATUS, true)) {
            http_response_code(400);
            return ['error' => 'Filtro de status inválido. Valores permitidos: ' . implode(', ', self::ALLOWED_STATUS)];
        }

        try {
            $data  = $this->repository->findAll($search, $status);
            $stats = $this->repository->countByStatus();

            return ['stats' => $stats, 'data' => $data];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar currículos: ' . $e->getMessage()];
        }
    }

    public function getCurriculo(string $id): array {
        $id = (int)$id;

        if (!$this->validarId($id)) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        try {
            $curriculo = $this->repository->findById($id);

            if (!$curriculo) {
                http_response_code(404);
                return ['error' => 'Candidatura não encontrada'];
            }

            return ['curriculo' => $curriculo];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar candidatura: ' . $e->getMessage()];
        }
    }

    public function updateStatus(string $id, array $body): array {
        $id     = (int)$id;
        $status = $body['status'] ?? null;

        if (!$this->validarId($id)) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        if (!$status || !in_array($status, self::ALLOWED_STATUS, true)) {
            http_response_code(400);
            return ['error' => 'Status inválido. Valores permitidos: ' . implode(', ', self::ALLOWED_STATUS)];
        }

        try {
            $curriculo = $this->repository->findById($id);

            if (!$curriculo) {
                http_response_code(404);
                return ['error' => 'Candidatura não encontrada'];
            }

            if ($curriculo['status'] === $status) {
                http_response_code(409);
                return ['error' => "A candidatura já está com status '$status'"];
            }

            $this->repository->updateStatus($id, $status);

            return ['message' => "Status atualizado para '$status'"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar status: ' . $e->getMessage()];
        }
    }

    public function deleteCurriculo(string $id): array {
        $id = (int)$id;

        if (!$this->validarId($id)) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        try {
            $deleted = $this->repository->delete($id);

            if (!$deleted) {
                http_response_code(404);
                return ['error' => 'Candidatura não encontrada'];
            }

            return ['message' => "Candidatura $id removida com sucesso"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover candidatura: ' . $e->getMessage()];
        }
    }
}