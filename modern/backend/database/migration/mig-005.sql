ALTER TABLE Papeis
  ADD COLUMN ver_cupons        BOOLEAN DEFAULT FALSE,
  ADD COLUMN ver_relatorios    BOOLEAN DEFAULT FALSE,
  ADD COLUMN ver_usuarios      BOOLEAN DEFAULT FALSE,
  ADD COLUMN ver_configuracoes BOOLEAN DEFAULT FALSE;

UPDATE Papeis SET ver_cupons=1, ver_relatorios=1, ver_usuarios=1, ver_configuracoes=1 WHERE id=2;
