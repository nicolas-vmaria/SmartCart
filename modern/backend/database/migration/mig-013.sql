ALTER TABLE Papeis ADD COLUMN ver_customizacao BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE Papeis SET ver_customizacao = TRUE;
