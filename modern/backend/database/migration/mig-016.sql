ALTER TABLE Aplicacao
    ADD COLUMN status ENUM('novo', 'em_analise', 'aprovado', 'reprovado') NOT NULL DEFAULT 'novo';
