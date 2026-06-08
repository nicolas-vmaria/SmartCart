<?php

require_once __DIR__ . '/../core/connection.php';

class AuditRepository {
    public static function log(
        int $adminId,
        string $adminNome,
        string $acao,
        string $entidade,
        ?int $entidadeId = null,
        ?array $detalhes = null
    ): void {
        try {
            $db   = Connection::get();
            $stmt = $db->prepare(
                'INSERT INTO AuditLog (admin_id, admin_nome, acao, entidade, entidade_id, detalhes) VALUES (?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $adminId,
                $adminNome,
                $acao,
                $entidade,
                $entidadeId,
                $detalhes ? json_encode($detalhes, JSON_UNESCAPED_UNICODE) : null,
            ]);
        } catch (\Throwable $e) {
            // Falha no audit não deve bloquear a operação principal
        }
    }
}
