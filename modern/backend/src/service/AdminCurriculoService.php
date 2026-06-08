<?php

require_once __DIR__ . '/../repository/AdminCurriculosRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';
require_once __DIR__ . '/../core/Mailer.php';

class AdminCurriculoService {
    private AdminCurriculosRepository $repository;

    private const ALLOWED_STATUS = ['novo', 'em_analise', 'aprovado', 'reprovado'];

    public function __construct(?AdminCurriculosRepository $repo = null) {
        $this->repository = $repo ?? new AdminCurriculosRepository();
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

    public function updateStatus(string $id, array $body, ?array $admin = null): array {
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

            try {
                $mailer = new Mailer();
                $mailer->send($curriculo['email'], $this->emailAssunto($status), $this->buildEmail($curriculo, $status));
            } catch (Exception $e) {
                // Falha no email não impede a resposta de sucesso
            }

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'atualizar_status', 'curriculo', $id, ['status' => $status]);
            return ['message' => "Status atualizado para '$status'"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao atualizar status: ' . $e->getMessage()];
        }
    }

    private function emailAssunto(string $status): string {
        return match($status) {
            'em_analise' => 'Sua candidatura está em análise — SmartCart',
            'aprovado'   => 'Parabéns! Sua candidatura foi aprovada — SmartCart',
            'reprovado'  => 'Resultado da sua candidatura — SmartCart',
            default      => 'Atualização da sua candidatura — SmartCart',
        };
    }

    private function buildEmail(array $c, string $status): string {
        $nome  = htmlspecialchars($c['nome']);
        $vaga  = htmlspecialchars($c['vaga_nome'] ?? $c['cargo'] ?? 'candidatura');

        $configs = [
            'em_analise' => [
                'cor'    => '#7c3aed',
                'titulo' => 'Candidatura em análise',
                'corpo'  => "Sua candidatura para a vaga <strong>{$vaga}</strong> está sendo analisada pela nossa equipe. Em breve você receberá um retorno.",
            ],
            'aprovado' => [
                'cor'    => '#16a34a',
                'titulo' => 'Candidatura aprovada!',
                'corpo'  => "Parabéns! Sua candidatura para a vaga <strong>{$vaga}</strong> foi aprovada. Nossa equipe entrará em contato com você em breve com os próximos passos.",
            ],
            'reprovado' => [
                'cor'    => '#dc2626',
                'titulo' => 'Resultado da candidatura',
                'corpo'  => "Agradecemos o seu interesse na vaga <strong>{$vaga}</strong>. Após análise cuidadosa, não seguiremos com sua candidatura neste momento. Desejamos sucesso na sua jornada profissional!",
            ],
        ];

        $m = $configs[$status] ?? [
            'cor'    => '#16a34a',
            'titulo' => 'Atualização da candidatura',
            'corpo'  => "Houve uma atualização na sua candidatura para <strong>{$vaga}</strong>.",
        ];

        return "
<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;'>
    <div style='border-left: 4px solid {$m['cor']}; padding-left: 16px; margin-bottom: 24px;'>
        <p style='margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;'>SmartCart</p>
        <h2 style='margin: 4px 0 0; color: #111827; font-size: 22px;'>{$m['titulo']}</h2>
    </div>

    <p style='color: #374151; font-size: 15px;'>Olá, <strong>{$nome}</strong>!</p>
    <p style='color: #374151; font-size: 15px; line-height: 1.6;'>{$m['corpo']}</p>

    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;'>
    <p style='color: #9ca3af; font-size: 12px; text-align: center; margin: 0;'>SmartCart &copy; " . date('Y') . " — Loja Inteligente</p>
</div>";
    }

    public function deleteCurriculo(string $id, ?array $admin = null): array {
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

            if ($admin) AuditRepository::log((int)$admin['userId'], $admin['nome'], 'deletar', 'curriculo', $id);
            return ['message' => "Candidatura $id removida com sucesso"];
        } catch (RuntimeException $e) {
            http_response_code(500);
            return ['error' => 'Erro interno ao remover candidatura: ' . $e->getMessage()];
        }
    }
}