-- Índices para otimizar queries do carrinho
CREATE INDEX idx_carrinhos_usuario_status ON Carrinhos(usuario_id, status);
CREATE INDEX idx_itens_carrinho_carrinho ON Itens_Carrinho(carrinho_id);
