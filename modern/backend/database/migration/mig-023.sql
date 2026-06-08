CREATE INDEX idx_pedidos_status     ON Pedidos(status);
CREATE INDEX idx_pedidos_usuario    ON Pedidos(usuario_id);
CREATE INDEX idx_pedidos_created_at ON Pedidos(created_at);
CREATE INDEX idx_review_produto     ON Review(produto_id);
CREATE INDEX idx_produtos_status    ON Produtos(status);
