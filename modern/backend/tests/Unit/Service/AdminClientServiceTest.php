<?php

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\Attributes\AllowMockObjectsWithoutExpectations;

require_once __DIR__ . '/../../../src/service/AdminClientService.php';

#[AllowMockObjectsWithoutExpectations]
class AdminClientServiceTest extends TestCase
{
    private function makeRepo(): AdminClientRepository
    {
        return $this->createMock(AdminClientRepository::class);
    }

    public function test_getAllClients_retorna_lista(): void
    {
        $repo = $this->makeRepo();
        $repo->method('getAllClients')->willReturn([
            ['id' => 1, 'nome' => 'João'],
            ['id' => 2, 'nome' => 'Maria'],
        ]);

        $result = (new AdminClientService($repo))->getAllClients();
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
    }

    public function test_deleteClient_sucesso_retorna_mensagem(): void
    {
        $repo = $this->makeRepo();
        $repo->expects($this->once())->method('deleteClient')->with(1);

        $result = (new AdminClientService($repo))->deleteClient(1);
        $this->assertArrayHasKey('message', $result);
        $this->assertStringContainsString('removido', $result['message']);
    }
}
