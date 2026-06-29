ALTER TABLE AdminReports
  MODIFY status ENUM('novo', 'enviado', 'erro', 'em_atendimento', 'resolvido', 'fechado') NOT NULL DEFAULT 'novo',
  ADD COLUMN tecnico_id INT NULL AFTER erro_envio,
  ADD COLUMN tecnico_nome VARCHAR(255) NULL AFTER tecnico_id,
  ADD COLUMN resolucao TEXT NULL AFTER tecnico_nome,
  ADD COLUMN resolvido_at DATETIME NULL AFTER resolucao,
  ADD CONSTRAINT fk_admin_reports_tecnico FOREIGN KEY (tecnico_id) REFERENCES Usuario(id);

CREATE INDEX idx_admin_reports_tecnico ON AdminReports(tecnico_id);
CREATE INDEX idx_admin_reports_resolvido_at ON AdminReports(resolvido_at);
