CREATE DATABASE IF NOT EXISTS smartCart;
USE smartCart;

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf varchar(11),
    telefone varchar (11),
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    id_imagem VARCHAR(20)
);

CREATE TABLE Orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_empresa VARCHAR(100) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    email VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    cep VARCHAR(8) NOT NULL,
    produtos TEXT NOT NULL,
    quantidades INT NOT NULL,
    prazo_entrega DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL
);

CREATE TABLE Contatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    assunto VARCHAR(150) NOT NULL,
    mensagem VARCHAR(255) NOT NULL
);

CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    id_orcamento INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_produto) REFERENCES Produtos(id)
);


insert into Produtos (nome, preco, estoque, id_imagem) values
("carrinho de compras", 150.00, 10, "img1"),
("caixa registradora", 300.00, 5, "img2"),
("leitor de código de barras", 200.00, 8, "img3"),
("balança digital", 250.00, 7, "img4"),
("gôndola de supermercado", 400.00, 3, "img5");


ALTER TABLE Usuario ADD COLUMN admin BOOLEAN DEFAULT FALSE;


