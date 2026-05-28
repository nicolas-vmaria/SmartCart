-- Novas chaves de marketing
INSERT INTO Configuracoes (chave, valor) VALUES
    ('popup_ativo',         '0'),
    ('popup_titulo',        ''),
    ('popup_texto',         ''),
    ('popup_imagem',        ''),
    ('popup_botao_texto',   ''),
    ('popup_botao_link',    ''),
    ('frete_gratis_minimo', '500')
ON DUPLICATE KEY UPDATE valor = valor;

-- Coluna destaque nos produtos
ALTER TABLE Produtos ADD COLUMN destaque BOOLEAN NOT NULL DEFAULT FALSE;

-- Permissão de marketing
ALTER TABLE Papeis ADD COLUMN ver_marketing BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE Papeis SET ver_marketing = TRUE;
