CREATE TABLE CuponsUsoUsuarios (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    cupom_id   INT NOT NULL,
    usuario_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_cupom_usuario (cupom_id, usuario_id),
    FOREIGN KEY (cupom_id)   REFERENCES Cupons(id)   ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id) ON DELETE CASCADE
);
