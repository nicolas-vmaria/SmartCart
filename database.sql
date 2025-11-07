CREATE DATABASE IF NOT EXISTS SmartCart;
USE SmartCart;

CREATE TABLE Usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf varchar(11),
    telefone varchar (11),
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);