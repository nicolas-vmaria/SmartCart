<?php

require_once __DIR__ . '/../core/Mailer.php';
require_once __DIR__ . '/../repository/AdminReportRepository.php';
require_once __DIR__ . '/../repository/AuditRepository.php';

class AdminReportService {
    private AdminReportRepository $repository;

    public function __construct(?AdminReportRepository $repo = null) {
        $this->repository = $repo ?? new AdminReportRepository();
    }

    public function send(array $body, array $admin): array {
        $titulo = isset($body['titulo']) ? trim((string)$body['titulo']) : '';
        $problemaCentral = isset($body['problemaCentral']) ? trim((string)$body['problemaCentral']) : '';
        $categoria = isset($body['categoria']) ? trim((string)$body['categoria']) : '';
        $prioridade = isset($body['prioridade']) ? trim((string)$body['prioridade']) : '';
        $contextoAfetado = isset($body['pagina']) ? trim((string)$body['pagina']) : '';
        $descricao = isset($body['descricao']) ? trim((string)$body['descricao']) : '';
        $passos = isset($body['passos']) ? trim((string)$body['passos']) : '';
        $navegador = isset($body['navegador']) ? trim((string)$body['navegador']) : '';

        if ($titulo === '' || $problemaCentral === '' || $categoria === '' || $prioridade === '' || $descricao === '') {
            http_response_code(400);
            return ['error' => 'Preencha titulo, problema central, tipo, prioridade e descricao'];
        }

        if (strlen($titulo) < 5 || strlen($descricao) < 20) {
            http_response_code(400);
            return ['error' => 'Informe um titulo e uma descricao mais detalhados'];
        }

        $adminNome = (string)($admin['nome'] ?? 'Admin');
        $adminEmail = (string)($admin['email'] ?? '');
        $destino = $_ENV['REPORTS_EMAIL'] ?? $_ENV['SUPPORT_EMAIL'] ?? 'contato.smartcart@gmail.com';

        try {
            $report = $this->repository->create([
                'admin_id' => (int)($admin['userId'] ?? 0),
                'admin_nome' => $adminNome,
                'admin_email' => $adminEmail ?: null,
                'problema_central' => $problemaCentral,
                'categoria' => $categoria,
                'prioridade' => $prioridade,
                'contexto_afetado' => $contextoAfetado ?: null,
                'titulo' => $titulo,
                'descricao' => $descricao,
                'passos' => $passos ?: null,
                'navegador' => $navegador ?: null,
            ]);
            $reportId = (int)$report['id'];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao salvar report. Tente novamente.'];
        }

        $html = $this->buildEmail([
            'id' => $reportId,
            'titulo' => $titulo,
            'problemaCentral' => $problemaCentral,
            'categoria' => $categoria,
            'prioridade' => $prioridade,
            'contextoAfetado' => $contextoAfetado,
            'descricao' => $descricao,
            'passos' => $passos,
            'navegador' => $navegador,
            'adminNome' => $adminNome,
            'adminEmail' => $adminEmail,
        ]);

        try {
            $mailer = new Mailer();
            $mailer->send(
                $destino,
                "[SmartCart Report] {$problemaCentral} / {$prioridade} - {$titulo}",
                $html,
                filter_var($adminEmail, FILTER_VALIDATE_EMAIL) ? $adminEmail : ''
            );

            $this->repository->markSent($reportId);
            AuditRepository::log((int)($admin['userId'] ?? 0), $adminNome, 'criar', 'report', $reportId, [
                'problema_central' => $problemaCentral,
                'categoria' => $categoria,
                'prioridade' => $prioridade,
            ]);

            return ['message' => 'Report enviado com sucesso', 'report_id' => $reportId];
        } catch (Exception $e) {
            $this->repository->markError($reportId, $e->getMessage());
            http_response_code(500);
            return ['error' => 'Report salvo, mas houve erro ao enviar e-mail.', 'report_id' => $reportId];
        }
    }

    private function buildEmail(array $data): string {
        $field = fn(string $key) => nl2br(htmlspecialchars((string)($data[$key] ?? ''), ENT_QUOTES, 'UTF-8'));

        return "
        <div style='font-family:Arial,sans-serif;max-width:680px;margin:0 auto;color:#111827'>
            <div style='background:#18572C;color:#E9FF75;padding:20px 24px;border-radius:14px 14px 0 0'>
                <p style='margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#d9f99d'>Novo report no painel admin</p>
                <h1 style='margin:6px 0 0;font-size:22px'>{$field('titulo')}</h1>
            </div>
            <div style='border:1px solid #e5e7eb;border-top:0;padding:24px;border-radius:0 0 14px 14px;background:#ffffff'>
                <table style='width:100%;border-collapse:collapse;margin-bottom:20px'>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280;width:130px'>ID do report</td>
                        <td style='padding:8px 0;font-weight:bold'>#{$field('id')}</td>
                    </tr>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280;width:130px'>Problema central</td>
                        <td style='padding:8px 0;font-weight:bold'>{$field('problemaCentral')}</td>
                    </tr>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280;width:130px'>Categoria</td>
                        <td style='padding:8px 0;font-weight:bold'>{$field('categoria')}</td>
                    </tr>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280'>Prioridade</td>
                        <td style='padding:8px 0;font-weight:bold'>{$field('prioridade')}</td>
                    </tr>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280'>Contexto afetado</td>
                        <td style='padding:8px 0'>{$field('contextoAfetado')}</td>
                    </tr>
                    <tr>
                        <td style='padding:8px 0;color:#6b7280'>Admin</td>
                        <td style='padding:8px 0'>{$field('adminNome')} &lt;{$field('adminEmail')}&gt;</td>
                    </tr>
                </table>

                <h2 style='font-size:15px;margin:20px 0 8px;color:#18572C'>Descricao</h2>
                <div style='white-space:normal;line-height:1.6;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px'>{$field('descricao')}</div>

                <h2 style='font-size:15px;margin:20px 0 8px;color:#18572C'>Passos para reproduzir</h2>
                <div style='white-space:normal;line-height:1.6;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px'>{$field('passos')}</div>

                <h2 style='font-size:15px;margin:20px 0 8px;color:#18572C'>Ambiente</h2>
                <p style='font-size:13px;color:#4b5563;line-height:1.5'>{$field('navegador')}</p>
            </div>
        </div>";
    }
}
