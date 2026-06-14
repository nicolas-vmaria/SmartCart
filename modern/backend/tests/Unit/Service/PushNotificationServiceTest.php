<?php

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../../../src/service/PushNotificationService.php';

/**
 * Subclasse testável: captura o que seria enviado ao Expo Push API
 * sem fazer chamada HTTP real.
 */
class TestablePushNotificationService extends PushNotificationService {
    public array $dispatched = [];

    protected function dispatch(array $tokens, string $title, string $body): void {
        $this->dispatched[] = compact('tokens', 'title', 'body');
    }
}

class PushNotificationServiceTest extends TestCase
{
    private function makeRepo(array $tokens = []): PushTokenRepository
    {
        $repo = $this->createMock(PushTokenRepository::class);
        $repo->method('findAll')->willReturn($tokens);
        return $repo;
    }

    private function makeService(array $tokens = []): TestablePushNotificationService
    {
        return new TestablePushNotificationService($this->makeRepo($tokens));
    }

    // ─── send: sem tokens ────────────────────────────────────────────────────

    public function test_send_sem_tokens_nao_faz_dispatch(): void
    {
        $svc = $this->makeService([]);
        $svc->send('Título', 'Mensagem');

        $this->assertEmpty($svc->dispatched);
    }

    // ─── send: com tokens ────────────────────────────────────────────────────

    public function test_send_com_um_token_faz_dispatch_uma_vez(): void
    {
        $svc = $this->makeService(['ExponentPushToken[abc123]']);
        $svc->send('Novo pedido', 'Pedido #1');

        $this->assertCount(1, $svc->dispatched);
    }

    public function test_send_com_multiplos_tokens_inclui_todos(): void
    {
        $tokens = ['ExponentPushToken[aaa]', 'ExponentPushToken[bbb]', 'ExponentPushToken[ccc]'];
        $svc = $this->makeService($tokens);
        $svc->send('Título', 'Corpo');

        $this->assertCount(1, $svc->dispatched);
        $this->assertSame($tokens, $svc->dispatched[0]['tokens']);
    }

    public function test_send_repassa_titulo_corretamente(): void
    {
        $svc = $this->makeService(['ExponentPushToken[x]']);
        $svc->send('🛒 Novo pedido!', 'Pedido #42 · R$ 150,00');

        $this->assertSame('🛒 Novo pedido!', $svc->dispatched[0]['title']);
    }

    public function test_send_repassa_corpo_corretamente(): void
    {
        $svc = $this->makeService(['ExponentPushToken[x]']);
        $svc->send('Título', 'Pedido #99 · R$ 299,90');

        $this->assertSame('Pedido #99 · R$ 299,90', $svc->dispatched[0]['body']);
    }

    // ─── send: chamadas múltiplas ────────────────────────────────────────────

    public function test_send_chamado_duas_vezes_faz_dois_dispatches(): void
    {
        $svc = $this->makeService(['ExponentPushToken[x]']);
        $svc->send('Pedido 1', 'Corpo 1');
        $svc->send('Pedido 2', 'Corpo 2');

        $this->assertCount(2, $svc->dispatched);
        $this->assertSame('Pedido 1', $svc->dispatched[0]['title']);
        $this->assertSame('Pedido 2', $svc->dispatched[1]['title']);
    }

    // ─── integração com repository ───────────────────────────────────────────

    public function test_send_consulta_tokens_do_repository(): void
    {
        $repo = $this->createMock(PushTokenRepository::class);
        $repo->expects($this->once())
             ->method('findAll')
             ->willReturn(['ExponentPushToken[z]']);

        $svc = new TestablePushNotificationService($repo);
        $svc->send('T', 'B');

        $this->assertCount(1, $svc->dispatched);
    }

    public function test_send_nao_chama_dispatch_quando_repository_retorna_vazio(): void
    {
        $repo = $this->createMock(PushTokenRepository::class);
        $repo->expects($this->once())->method('findAll')->willReturn([]);

        $svc = new TestablePushNotificationService($repo);
        $svc->send('T', 'B');

        $this->assertEmpty($svc->dispatched);
    }
}
