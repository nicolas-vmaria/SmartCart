ALTER TABLE Trabalho
    ADD COLUMN slug VARCHAR(255) UNIQUE NOT NULL AFTER nome;

ALTER TABLE Aplicacao
    CHANGE COLUMN portifolio_url portfolio_url VARCHAR(500);


ALTER TABLE Aplicacao
    MODIFY COLUMN trabalho_id INT NULL;

ALTER TABLE Aplicacao
    ADD COLUMN area_interesse VARCHAR(100) NULL AFTER trabalho_id;