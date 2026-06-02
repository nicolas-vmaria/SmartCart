-- Renomeia notify_novos_clientes para notify_novos_curriculos
UPDATE Configuracoes SET chave = 'notify_novos_curriculos' WHERE chave = 'notify_novos_clientes';

-- Garante que a chave existe com valor padrão caso mig-020 ainda não tenha sido executado
INSERT IGNORE INTO Configuracoes (chave, valor) VALUES ('notify_novos_curriculos', '1');
