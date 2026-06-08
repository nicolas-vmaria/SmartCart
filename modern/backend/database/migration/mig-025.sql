CREATE TABLE IF NOT EXISTS AuditLog (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_nome VARCHAR(255) NOT NULL,
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id INT NULL,
    detalhes JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Usuario(id)
);

ALTER TABLE Papeis ADD COLUMN ver_auditoria BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE Papeis SET ver_auditoria = TRUE WHERE id = 2;
