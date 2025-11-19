create database smartcart;
use smartcart;


create table Produto (
 id_produto int auto_increment primary key,
 nome varchar(45) not null,
 estoque int not null,
 preco float not null,
 id_imagem int
);


create table Usuario (
	id_usuario int auto_increment primary key,
    produto_id int,
    nome varchar(45) not null,
    email varchar(100) not null,
    telefone bigint(11) not null
);


