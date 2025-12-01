CREATE DATABASE IF NOT EXISTS smart_cart;
USE smart_cart;

CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    telefone VARCHAR(11),
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE Produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10 , 2 ) NOT NULL,
    estoque INT DEFAULT 0,
    id_imagem VARCHAR(20),
    descricao VARCHAR(200) NOT NULL
);

CREATE TABLE Orcamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_produto INT NOT NULL,
    nome_empresa VARCHAR(100) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    email VARCHAR(100) NOT NULL,
    endereco VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    cep VARCHAR(8) NOT NULL,
    nome_produto TEXT NOT NULL,
    quantidades INT NOT NULL,
    prazo_entrega DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id),
    FOREIGN KEY (id_produto)
        REFERENCES Produtos (id)
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
    nome_produto VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10 , 2 ) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pendente',
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario)
        REFERENCES Usuario (id),
    FOREIGN KEY (id_produto)
        REFERENCES Produtos (id),
    FOREIGN KEY (id_orcamento)
        REFERENCES Orcamentos (id)
);


insert into Produtos (nome, preco, estoque, id_imagem) values
("SmartCart", 649.00, 5000, "img1.png"),
("DoubleCart", 760.00, 1000, "img2"),
("SmartGlide", 490.00, 800, "img3"),
("SmartConfort ", 399.00, 50, "img4"),
("SmartDrop", 180.00, 3000, "img5");


ALTER TABLE Usuario ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

insert into Usuario (nome, cnpj, telefone, email, senha, is_admin)
values ("Caio", "12345678909876", "47992451974", "boing@gmail.com", "cb889e05f91275a69d2fb0f7ee4af3b92dae9a0e6ecfcf597bda893a49fb2673", true);

update Pedidos set status = "Respondido" WHERE id = 10;

select * from Orcamentos;
select * from Usuario;


