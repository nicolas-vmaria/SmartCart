SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS Resetar_Senha;
DROP TABLE IF EXISTS Aplicacao;
DROP TABLE IF EXISTS Trabalho;
DROP TABLE IF EXISTS Review;
DROP TABLE IF EXISTS Itens_Pedido;
DROP TABLE IF EXISTS Pedidos;
DROP TABLE IF EXISTS Itens_Carrinho;
DROP TABLE IF EXISTS Carrinhos;
DROP TABLE IF EXISTS Cupons;
DROP TABLE IF EXISTS Produtos;
DROP TABLE IF EXISTS Categorias;
DROP TABLE IF EXISTS Usuario;
DROP TABLE IF EXISTS Papeis;

SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE Papeis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_papel VARCHAR(50) NOT NULL,
    badge VARCHAR(255),
    descricao TEXT,
    ver_dashboard BOOLEAN DEFAULT FALSE,
    ver_clientes BOOLEAN DEFAULT FALSE,
    ver_categorias BOOLEAN DEFAULT FALSE,
    ver_produtos BOOLEAN DEFAULT FALSE,
    ver_pedidos BOOLEAN DEFAULT FALSE,
    ver_admin BOOLEAN DEFAULT FALSE,
    ver_curriculos BOOLEAN DEFAULT FALSE,
    ver_trabalhos BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    papel_id INT NOT NULL DEFAULT 1,
    is_admin BOOLEAN DEFAULT FALSE,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (papel_id) REFERENCES Papeis(id)
);

CREATE TABLE Categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pai_id INT NULL,
    nome VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pai_id) REFERENCES Categorias(id)
);

CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT DEFAULT 0,
    descricao TEXT,
    foto_url VARCHAR(500),
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id)
);

CREATE TABLE Cupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo_desconto ENUM('percentual', 'fixo') DEFAULT 'percentual',
    desconto DECIMAL(10,2) NOT NULL,
    data_validade DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Carrinhos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    status ENUM('ativo', 'abandonado', 'convertido') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

CREATE TABLE Itens_Carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carrinho_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carrinho_id) REFERENCES Carrinhos(id),
    FOREIGN KEY (produto_id) REFERENCES Produtos(id)
);

CREATE TABLE Pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    carrinho_id INT NULL,
    id_cupom INT NULL,
    metodo_pagamento ENUM('pix', 'boleto', 'cartao_debito', 'cartao_credito') NOT NULL,
    transacao_id VARCHAR(255) UNIQUE,
    status ENUM('aguardando', 'pago', 'enviado', 'entregue', 'cancelado') DEFAULT 'aguardando',
    total DECIMAL(10,2) NOT NULL,
    cep CHAR(8),
    rua VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(255),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado CHAR(2),
    codigo_rastreio VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES Usuario(id),
    FOREIGN KEY (carrinho_id) REFERENCES Carrinhos(id),
    FOREIGN KEY (id_cupom) REFERENCES Cupons(id)
);

CREATE TABLE Itens_Pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario_historico DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES Produtos(id)
);

CREATE TABLE Review (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    produto_id INT NOT NULL,
    nota INT CHECK (nota BETWEEN 1 AND 5),
    descricao TEXT,
    qtd_likes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review (user_id, produto_id),
    FOREIGN KEY (user_id) REFERENCES Usuario(id),
    FOREIGN KEY (produto_id) REFERENCES Produtos(id)
);

CREATE TABLE Trabalho (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cargo VARCHAR(100),
    area VARCHAR(100),
    tipo_contrato VARCHAR(50),
    formato_trabalho VARCHAR(50),
    local VARCHAR(100),
    requisitos TEXT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Aplicacao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trabalho_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    tel VARCHAR(20),
    portifolio_url VARCHAR(500),
    curriculo_url VARCHAR(500),
    carta_apresent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trabalho_id) REFERENCES Trabalho(id)
);

CREATE TABLE Resetar_Senha (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    create_at DATETIME NOT NULL,
    expire_at DATETIME NOT NULL
);
