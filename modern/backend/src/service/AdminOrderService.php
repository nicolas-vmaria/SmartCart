<?php

require_once __DIR__ . '/../repository/AdminOrderRepository.php';
require_once __DIR__ . '/../core/Mailer.php';

use Dompdf\Dompdf;
use Dompdf\Options;

class AdminOrderService {
    private AdminOrderRepository $repository;

    private const STATUS_ASSUNTO = [
        'aguardando' => 'Pedido recebido — SmartCart',
        'pago'       => 'Pagamento confirmado — SmartCart',
        'enviado'    => 'Seu pedido está a caminho — SmartCart',
        'entregue'   => 'Pedido entregue — SmartCart',
        'cancelado'  => 'Pedido cancelado — SmartCart',
    ];

    public function __construct() {
        $this->repository = new AdminOrderRepository();
    }

    public function getAllOrders(): array {
        try {
            return ['orders' => $this->repository->getAllOrders()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedidos'];
        }
    }

    public function getOrderById(int $id): array {
        try {
            $order = $this->repository->getOrderById($id);
            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
            $order['itens'] = $this->repository->getOrderItems($id);
            return ['order' => $order];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar pedido'];
        }
    }

    public function updateStatus(int $id, array $body): array {
        $statusValidos = ['aguardando', 'pago', 'enviado', 'entregue', 'cancelado'];

        if (empty($body['status']) || !in_array($body['status'], $statusValidos)) {
            http_response_code(400);
            return ['error' => 'Status inválido'];
        }

        $novoStatus     = $body['status'];
        $codigoRastreio = $body['codigo_rastreio'] ?? null;

        try {
            $order = $this->repository->getOrderById($id);
            if (!$order) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }

            $itens = $novoStatus === 'pago' ? $this->repository->getOrderItems($id) : [];

            $updated = $this->repository->updateStatus($id, $novoStatus, $codigoRastreio);
            if (!$updated) {
                http_response_code(404);
                return ['error' => 'Pedido não encontrado'];
            }
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao atualizar status'];
        }

        try {
            $mailer       = new Mailer();
            $assunto      = self::STATUS_ASSUNTO[$novoStatus] ?? 'Atualização do seu pedido — SmartCart';
            $corpo        = $this->buildEmail($order, $novoStatus, $codigoRastreio);
            $pdfConteudo  = null;
            $pdfNome      = null;

            if ($novoStatus === 'pago' && !empty($itens)) {
                $pdfConteudo = $this->buildInvoicePdf($order, $itens);
                $pdfNome     = 'nota-fiscal-' . str_pad($order['id'], 5, '0', STR_PAD_LEFT) . '.pdf';
            }

            $mailer->send($order['email'], $assunto, $corpo, '', $pdfConteudo, $pdfNome ?? 'nota-fiscal.pdf');
        } catch (Exception $e) {
            // Falha no email não impede a resposta de sucesso
        }

        return ['message' => 'Status atualizado com sucesso'];
    }

    public function getMonthlyAnalytics(): array {
        try {
            return ['analytics' => $this->repository->getMonthlyAnalytics()];
        } catch (Exception $e) {
            http_response_code(500);
            return ['error' => 'Erro ao buscar analytics'];
        }
    }

    private function buildInvoicePdf(array $order, array $itens): string {
        $orderId  = '#' . str_pad($order['id'], 5, '0', STR_PAD_LEFT);
        $nome     = htmlspecialchars($order['nome']);
        $total    = 'R$ ' . number_format($order['total'], 2, ',', '.');
        $data     = date('d/m/Y', strtotime($order['created_at']));
        $hora     = date('H:i', strtotime($order['created_at']));

        $linhasItens = '';
        foreach ($itens as $item) {
            $nomeItem = htmlspecialchars($item['nome']);
            $qty      = (int) $item['quantidade'];
            $unitario = 'R$ ' . number_format($item['preco_unitario_historico'], 2, ',', '.');
            $subtotal = 'R$ ' . number_format($item['subtotal'], 2, ',', '.');
            $linhasItens .= "
            <tr>
                <td>{$nomeItem}</td>
                <td style='text-align:center'>{$qty}</td>
                <td style='text-align:right'>{$unitario}</td>
                <td style='text-align:right'>{$subtotal}</td>
            </tr>";
        }

        $html = "
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
<meta charset='UTF-8'>
<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; font-size: 13px; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #16a34a; padding-bottom: 16px; margin-bottom: 20px; }
    .brand { font-size: 22px; font-weight: bold; color: #16a34a; }
    .brand span { font-size: 12px; font-weight: normal; color: #666; display: block; margin-top: 2px; }
    .invoice-info { text-align: right; font-size: 12px; color: #555; }
    .invoice-info strong { font-size: 17px; color: #1a1a1a; display: block; margin-bottom: 3px; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; text-transform: uppercase; color: #999; letter-spacing: 1px; margin-bottom: 6px; }
    .info-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0; }
    .info-row span:first-child { color: #666; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #f9fafb; }
    th { text-align: left; padding: 8px 10px; font-size: 11px; color: #666; text-transform: uppercase; }
    td { padding: 10px; border-bottom: 1px solid #f0f0f0; }
    .total-row td { font-weight: bold; font-size: 14px; border-bottom: none; border-top: 2px solid #16a34a; color: #16a34a; }
    .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
</style>
</head>
<body>
    <div class='header'>
        <div class='brand'>SmartCart<span>Loja Inteligente</span></div>
        <div class='invoice-info'>
            <strong>NOTA FISCAL</strong>
            Pedido: {$orderId}<br>
            Data: {$data} às {$hora}
        </div>
    </div>
    <div class='section'>
        <div class='section-title'>Dados do cliente</div>
        <div class='info-row'><span>Nome</span><span>{$nome}</span></div>
    </div>
    <div class='section'>
        <div class='section-title'>Itens do pedido</div>
        <table>
            <thead>
                <tr><th>Produto</th><th style='text-align:center'>Qtd.</th><th style='text-align:right'>Unitário</th><th style='text-align:right'>Total</th></tr>
            </thead>
            <tbody>{$linhasItens}</tbody>
            <tfoot>
                <tr class='total-row'><td colspan='3'>Total</td><td style='text-align:right'>{$total}</td></tr>
            </tfoot>
        </table>
    </div>
    <div class='footer'>
        Documento gerado em " . date('d/m/Y') . " — SmartCart &copy; " . date('Y') . "
    </div>
</body>
</html>";

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return $dompdf->output();
    }

    private function buildEmail(array $order, string $status, ?string $rastreio): string {
        $orderId = '#' . str_pad($order['id'], 5, '0', STR_PAD_LEFT);
        $nome    = htmlspecialchars($order['nome']);
        $total   = 'R$ ' . number_format($order['total'], 2, ',', '.');

        $mensagens = [
            'aguardando' => [
                'titulo' => 'Pedido recebido!',
                'corpo'  => "Recebemos o seu pedido <strong>{$orderId}</strong> e já estamos processando. Assim que o pagamento for confirmado, você receberá a nota fiscal por e-mail.",
                'cor'    => '#ca8a04',
            ],
            'pago' => [
                'titulo' => 'Pagamento confirmado!',
                'corpo'  => "O pagamento do pedido <strong>{$orderId}</strong> foi confirmado. Abaixo está a sua nota fiscal. Em breve seu pedido será preparado para envio.",
                'cor'    => '#16a34a',
            ],
            'enviado' => [
                'titulo' => 'Pedido enviado!',
                'corpo'  => "Seu pedido <strong>{$orderId}</strong> saiu para entrega."
                    . ($rastreio ? " Código de rastreio: <strong>{$rastreio}</strong>." : ''),
                'cor'    => '#7c3aed',
            ],
            'entregue' => [
                'titulo' => 'Pedido entregue!',
                'corpo'  => "O pedido <strong>{$orderId}</strong> foi entregue no endereço informado. Esperamos que você aproveite sua compra!",
                'cor'    => '#16a34a',
            ],
            'cancelado' => [
                'titulo' => 'Pedido cancelado',
                'corpo'  => "O pedido <strong>{$orderId}</strong> foi cancelado. Se você tiver alguma dúvida, entre em contato com o nosso suporte.",
                'cor'    => '#dc2626',
            ],
        ];

        $m = $mensagens[$status] ?? [
            'titulo' => 'Atualização do pedido',
            'corpo'  => "O status do pedido <strong>{$orderId}</strong> foi atualizado.",
            'cor'    => '#16a34a',
        ];

        $notaFiscal = '';
        if ($status === 'pago' && !empty($itens)) {
            $linhasItens = '';
            foreach ($itens as $item) {
                $nomeItem  = htmlspecialchars($item['nome']);
                $qty       = (int) $item['quantidade'];
                $unitario  = 'R$ ' . number_format($item['preco_unitario_historico'], 2, ',', '.');
                $subtotal  = 'R$ ' . number_format($item['subtotal'], 2, ',', '.');
                $linhasItens .= "
                <tr>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0;'>{$nomeItem}</td>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: center;'>{$qty}</td>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;'>{$unitario}</td>
                    <td style='padding: 10px 12px; border-bottom: 1px solid #f0f0f0; text-align: right;'>{$subtotal}</td>
                </tr>";
            }

            $notaFiscal = "
    <div style='margin-top: 28px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;'>
        <div style='background: #16a34a; padding: 12px 16px;'>
            <p style='margin: 0; color: #fff; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;'>Nota Fiscal</p>
        </div>
        <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
            <thead>
                <tr style='background: #f9fafb;'>
                    <th style='padding: 10px 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;'>Produto</th>
                    <th style='padding: 10px 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;'>Qtd.</th>
                    <th style='padding: 10px 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;'>Unitário</th>
                    <th style='padding: 10px 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;'>Total</th>
                </tr>
            </thead>
            <tbody>{$linhasItens}</tbody>
            <tfoot>
                <tr style='background: #f9fafb;'>
                    <td colspan='3' style='padding: 12px; font-weight: bold; color: #111827; border-top: 2px solid #16a34a;'>Total</td>
                    <td style='padding: 12px; font-weight: bold; color: #16a34a; text-align: right; border-top: 2px solid #16a34a;'>{$total}</td>
                </tr>
            </tfoot>
        </table>
    </div>";
        }

        return "
<div style='font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff;'>
    <div style='border-left: 4px solid {$m['cor']}; padding-left: 16px; margin-bottom: 24px;'>
        <p style='margin: 0; font-size: 13px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px;'>SmartCart</p>
        <h2 style='margin: 4px 0 0; color: #111827; font-size: 22px;'>{$m['titulo']}</h2>
    </div>

    <p style='color: #374151; font-size: 15px;'>Olá, <strong>{$nome}</strong>!</p>
    <p style='color: #374151; font-size: 15px; line-height: 1.6;'>{$m['corpo']}</p>

    <div style='background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 24px 0;'>
        <div style='display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 6px;'>
            <span style='color: #6b7280;'>Número do pedido</span>
            <strong style='color: #111827;'>{$orderId}</strong>
        </div>
        <div style='display: flex; justify-content: space-between; font-size: 14px;'>
            <span style='color: #6b7280;'>Total</span>
            <strong style='color: #111827;'>{$total}</strong>
        </div>
    </div>

    {$notaFiscal}

    <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;'>
    <p style='color: #9ca3af; font-size: 12px; text-align: center; margin: 0;'>SmartCart &copy; " . date('Y') . " — Loja Inteligente</p>
</div>";
    }
}
