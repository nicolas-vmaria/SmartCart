<?php

require_once __DIR__ . '/../repository/ConfiguracoesRepository.php';
require_once __DIR__ . '/../core/Mailer.php';

class NotificationService {

    private static function cfg(): array {
        return (new ConfiguracoesRepository())->findAll();
    }

    private static function adminEmail(): string {
        return $_ENV['MAIL_USER'];
    }

    public static function notifyNewOrder(int $pedidoId, float $total, string $metodo): void {
        try {
            $cfg = self::cfg();
            if (($cfg['notify_novos_pedidos'] ?? '0') !== '1') return;

            $totalFmt = 'R$ ' . number_format($total, 2, ',', '.');
            $mailer   = new Mailer();
            $mailer->send(
                self::adminEmail(),
                "Novo pedido #{$pedidoId} recebido — SmartCart",
                "
                <div style='font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a'>
                    <h2 style='color:#1a5c2e'>Novo pedido recebido!</h2>
                    <p>O pedido <strong>#{$pedidoId}</strong> foi criado com sucesso.</p>
                    <table style='width:100%;border-collapse:collapse;margin:16px 0'>
                        <tr><td style='padding:8px;border:1px solid #e5e7eb'>Pedido</td><td style='padding:8px;border:1px solid #e5e7eb'><strong>#{$pedidoId}</strong></td></tr>
                        <tr><td style='padding:8px;border:1px solid #e5e7eb'>Total</td><td style='padding:8px;border:1px solid #e5e7eb'><strong>{$totalFmt}</strong></td></tr>
                        <tr><td style='padding:8px;border:1px solid #e5e7eb'>Pagamento</td><td style='padding:8px;border:1px solid #e5e7eb'>" . htmlspecialchars($metodo) . "</td></tr>
                    </table>
                    <a href='" . ($_ENV['FRONTEND_URL'] ?? '') . "/admin/orders' style='display:inline-block;background:#1a5c2e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none'>Ver pedidos</a>
                </div>"
            );
        } catch (Exception) {}
    }

    public static function notifyLowStock(string $nomeProduto, int $estoque): void {
        try {
            $cfg = self::cfg();
            if (($cfg['notify_estoque_baixo'] ?? '0') !== '1') return;
            if ($estoque >= 10 || $estoque < 0) return;

            $mailer = new Mailer();
            $nivel  = $estoque === 0 ? 'Sem estoque' : "Apenas {$estoque} restante(s)";
            $mailer->send(
                self::adminEmail(),
                "Estoque baixo: {$nomeProduto} — SmartCart",
                "
                <div style='font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a'>
                    <h2 style='color:#b45309'>⚠️ Estoque baixo</h2>
                    <p>O produto <strong>" . htmlspecialchars($nomeProduto) . "</strong> está com estoque crítico.</p>
                    <p style='font-size:1.2em'><strong>{$nivel}</strong></p>
                    <a href='" . ($_ENV['FRONTEND_URL'] ?? '') . "/admin/products' style='display:inline-block;background:#1a5c2e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none'>Gerenciar produtos</a>
                </div>"
            );
        } catch (Exception) {}
    }

    public static function notifyNewCurriculo(string $nome, string $cargo): void {
        try {
            $cfg = self::cfg();
            if (($cfg['notify_novos_curriculos'] ?? '0') !== '1') return;

            $mailer = new Mailer();
            $mailer->send(
                self::adminEmail(),
                "Novo currículo recebido — SmartCart",
                "
                <div style='font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a'>
                    <h2 style='color:#1a5c2e'>Novo currículo!</h2>
                    <p>Um novo currículo foi enviado para a loja.</p>
                    <table style='width:100%;border-collapse:collapse;margin:16px 0'>
                        <tr><td style='padding:8px;border:1px solid #e5e7eb'>Candidato</td><td style='padding:8px;border:1px solid #e5e7eb'>" . htmlspecialchars($nome) . "</td></tr>
                        <tr><td style='padding:8px;border:1px solid #e5e7eb'>Vaga</td><td style='padding:8px;border:1px solid #e5e7eb'>" . htmlspecialchars($cargo ?: 'Candidatura espontânea') . "</td></tr>
                    </table>
                    <a href='" . ($_ENV['FRONTEND_URL'] ?? '') . "/admin/curriculos' style='display:inline-block;background:#1a5c2e;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none'>Ver currículos</a>
                </div>"
            );
        } catch (Exception) {}
    }
}
