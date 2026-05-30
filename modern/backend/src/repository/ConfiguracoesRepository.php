<?php

require_once __DIR__ . '/../core/connection.php';

class ConfiguracoesRepository {
    private PDO $db;

    public function __construct() {
        $this->db = Connection::get();
    }

    public function findAll(): array {
        $stmt = $this->db->query('SELECT chave, valor FROM Configuracoes');
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($rows as $row) {
            $result[$row['chave']] = $row['valor'];
        }
        return $result;
    }

    public function setMany(array $data): void {
        $stmt = $this->db->prepare(
            'INSERT INTO Configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)'
        );
        foreach ($data as $chave => $valor) {
            $stmt->execute([$chave, $valor]);
        }
    }
}
