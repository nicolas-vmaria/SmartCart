CREATE TABLE IF NOT EXISTS AdminReports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    admin_nome VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NULL,
    problema_central VARCHAR(100) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    prioridade ENUM('Baixa', 'Media', 'Alta', 'Critica') NOT NULL DEFAULT 'Media',
    contexto_afetado VARCHAR(255) NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    passos TEXT NULL,
    navegador VARCHAR(1000) NULL,
    status ENUM('novo', 'enviado', 'erro') NOT NULL DEFAULT 'novo',
    erro_envio VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Usuario(id)
);

CREATE INDEX idx_admin_reports_admin ON AdminReports(admin_id);
CREATE INDEX idx_admin_reports_status ON AdminReports(status);
CREATE INDEX idx_admin_reports_prioridade ON AdminReports(prioridade);
CREATE INDEX idx_admin_reports_created_at ON AdminReports(created_at);
