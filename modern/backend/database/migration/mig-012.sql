CREATE TABLE Configuracoes (
    chave VARCHAR(100) PRIMARY KEY,
    valor VARCHAR(1000) NOT NULL DEFAULT ''
);

INSERT INTO Configuracoes (chave, valor) VALUES
('anuncio_ativo',        '0'),
('anuncio_texto',        'Frete grátis em compras acima de R$ 199'),
('anuncio_cor',          '#166534'),
('loja_telefone1',       '45 99999-9999'),
('loja_telefone2',       '47 99999-9999'),
('loja_email',           'sac@loja.com.br'),
('loja_cnpj',            '26.636.428/0001-19'),
('redes_instagram',      ''),
('redes_facebook',       ''),
('redes_whatsapp',       ''),
('redes_youtube',        ''),
('beneficio_1_titulo',   'Frete Grátis'),
('beneficio_1_descricao','Para todo o Brasil!'),
('beneficio_2_titulo',   'Garantia de 2 Anos'),
('beneficio_2_descricao','Não se preocupe, nossos produtos duram'),
('beneficio_3_titulo',   'Devolução Grátis'),
('beneficio_3_descricao','Você tem até 30 dias para devolver seu produto'),
('beneficio_4_titulo',   'Parcele Sem Juros'),
('beneficio_4_descricao','Em até 10x no cartão de crédito');
