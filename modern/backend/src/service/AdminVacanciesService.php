<?php

require_once __DIR__ . '/../repository/AdminVacanciesRepository.php';

class AdminVacanciesService {
    private AdminVacanciesRepository $repository;

    private const TIPOS_CONTRATO   = ['CLT', 'PJ', 'Estágio', 'Freelancer', 'Temporário'];
    private const FORMATOS         = ['Presencial', 'Remoto', 'Híbrido'];

    public function __construct() {
        $this->repository = new AdminVacanciesRepository();
    }

    public function getAllVacancies(): array {
        try {
            return ['vacancies' => $this->repository->getAll()];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao buscar vagas: ' . $e->getMessage()];
        }
    }

    public function getVacancyById(string $id): array {
    $idInt = (int)$id;
    if ($idInt <= 0) {
        http_response_code(400);
        return ['error' => 'ID inválido'];
    }

    try {
        $vacancy = $this->repository->findById($idInt);
        if (!$vacancy) {
            http_response_code(404);
            return ['error' => 'Vaga não encontrada'];
        }

        return ['vacancy' => $vacancy];
    } catch (RuntimeException $e) {
        http_response_code(500);
        return ['error' => 'Erro interno ao buscar vaga: ' . $e->getMessage()];
    }
    }

    private function validate(array $body): array {
        $nome            = trim((string)($body['nome'] ?? ''));
        $cargo           = trim((string)($body['cargo'] ?? ''));
        $area            = trim((string)($body['area'] ?? ''));
        $tipo_contrato   = trim((string)($body['tipo_contrato'] ?? ''));
        $formato         = trim((string)($body['formato_trabalho'] ?? ''));
        $local           = trim((string)($body['local'] ?? ''));
        $requisitos      = trim((string)($body['requisitos'] ?? ''));
        $ativaRaw        = $body['ativa'] ?? true;
        $ativa           = ($ativaRaw === true || $ativaRaw === 'true' || $ativaRaw === 1 || $ativaRaw === '1') ? 1 : 0;

        if ($nome === '') {
            http_response_code(400);
            return ['error' => 'O campo nome é obrigatório'];
        }
        if (strlen($nome) > 150) {
            http_response_code(400);
            return ['error' => 'O campo nome deve ter no máximo 150 caracteres'];
        }
        if ($cargo === '') {
            http_response_code(400);
            return ['error' => 'O campo cargo é obrigatório'];
        }
        if ($area === '') {
            http_response_code(400);
            return ['error' => 'O campo area é obrigatório'];
        }
        if (!in_array($tipo_contrato, self::TIPOS_CONTRATO, true)) {
            http_response_code(400);
            return ['error' => 'tipo_contrato inválido. Permitidos: ' . implode(', ', self::TIPOS_CONTRATO)];
        }
        if (!in_array($formato, self::FORMATOS, true)) {
            http_response_code(400);
            return ['error' => 'formato_trabalho inválido. Permitidos: ' . implode(', ', self::FORMATOS)];
        }
        if ($local === '') {
            http_response_code(400);
            return ['error' => 'O campo local é obrigatório'];
        }

        return [
            'nome'             => $nome,
            'cargo'            => $cargo,
            'area'             => $area,
            'tipo_contrato'    => $tipo_contrato,
            'formato_trabalho' => $formato,
            'local'            => $local,
            'requisitos'       => $requisitos,
            'ativa'            => $ativa,
        ];
    }

    public function createVacancy(array $body): array {
        $data = $this->validate($body);
        if (isset($data['error'])) return $data;

        try {
            if ($this->repository->findByNome($data['nome'])) {
                http_response_code(409);
                return ['error' => "Já existe uma vaga com o nome '{$data['nome']}'"];
            }

            $created = $this->repository->create($data);
            http_response_code(201);
            return [
                'message' => "Vaga '{$data['nome']}' criada com sucesso",
                'vacancy' => $created,
            ];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao criar vaga: ' . $e->getMessage()];
        }
    }

    public function updateVacancy(string $id, array $body): array {
        $idInt = (int)$id;
        if ($idInt <= 0) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        $data = $this->validate($body);
        if (isset($data['error'])) return $data;

        try {
            $existing = $this->repository->findById($idInt);
            if (!$existing) {
                http_response_code(404);
                return ['error' => 'Vaga não encontrada'];
            }

            // Verifica nome duplicado em outra vaga
            if ($this->repository->findByNome($data['nome'], $idInt)) {
                http_response_code(409);
                return ['error' => "Já existe outra vaga com o nome '{$data['nome']}'"];
            }

            // Verifica se algo realmente mudou
            $fields = ['nome', 'cargo', 'area', 'tipo_contrato', 'formato_trabalho', 'local', 'requisitos'];
            $changed = false;
            foreach ($fields as $field) {
                if ((string)($existing[$field] ?? '') !== (string)$data[$field]) {
                    $changed = true;
                    break;
                }
            }
            if (!$changed && (int)$existing['ativa'] === $data['ativa']) {
                http_response_code(400);
                return ['error' => 'Nenhuma alteração detectada'];
            }

            $this->repository->update($idInt, $data);
            return [
                'message' => "Vaga $idInt atualizada com sucesso",
                'vacancy' => $this->repository->findById($idInt),
            ];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar vaga: ' . $e->getMessage()];
        }
    }

    public function deleteVacancy(string $id): array {
        $idInt = (int)$id;
        if ($idInt <= 0) {
            http_response_code(400);
            return ['error' => 'ID inválido'];
        }

        try {
            if (!$this->repository->findById($idInt)) {
                http_response_code(404);
                return ['error' => 'Vaga não encontrada'];
            }

            if ($this->repository->hasApplications($idInt)) {
                http_response_code(409);
                return ['error' => 'Não é possível excluir uma vaga que possui candidaturas. Desative-a ao invés de excluir.'];
            }

            $this->repository->delete($idInt);
            return ['message' => "Vaga $idInt removida com sucesso"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover vaga: ' . $e->getMessage()];
        }
    }
}