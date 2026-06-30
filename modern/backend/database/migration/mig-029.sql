ALTER TABLE Papeis
  ADD COLUMN ver_reports BOOLEAN NOT NULL DEFAULT FALSE AFTER ver_auditoria,
  ADD COLUMN ver_chamados BOOLEAN NOT NULL DEFAULT FALSE AFTER ver_reports;

UPDATE Papeis
SET ver_reports = TRUE,
    ver_chamados = TRUE
WHERE id = 2;
