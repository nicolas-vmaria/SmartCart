ALTER TABLE Usuario ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Usuario ADD COLUMN token_verificacao VARCHAR(100) NULL;
UPDATE Usuario SET email_verificado = TRUE;
