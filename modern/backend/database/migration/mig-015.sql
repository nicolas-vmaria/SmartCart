-- Flash sale
INSERT INTO Configuracoes (chave, valor) VALUES
    ('flash_ativo',  '0'),
    ('flash_titulo', ''),
    ('flash_fim',    ''),
    ('flash_cor',    '#dc2626'),
    ('flash_link',   '')
ON DUPLICATE KEY UPDATE valor = valor;

-- Desconto progressivo
INSERT INTO Configuracoes (chave, valor) VALUES
    ('desconto_ativo',         '0'),
    ('desconto_faixa_1_minimo','300'),
    ('desconto_faixa_1_pct',   '5'),
    ('desconto_faixa_2_minimo','500'),
    ('desconto_faixa_2_pct',   '10'),
    ('desconto_faixa_3_minimo','800'),
    ('desconto_faixa_3_pct',   '15')
ON DUPLICATE KEY UPDATE valor = valor;

-- Compre junto
CREATE TABLE IF NOT EXISTS CompraJunto (
    produto_id       INT NOT NULL,
    produto_sugerido_id INT NOT NULL,
    PRIMARY KEY (produto_id),
    CONSTRAINT fk_cj_produto   FOREIGN KEY (produto_id)        REFERENCES Produtos(id) ON DELETE CASCADE,
    CONSTRAINT fk_cj_sugerido  FOREIGN KEY (produto_sugerido_id) REFERENCES Produtos(id) ON DELETE CASCADE
);
