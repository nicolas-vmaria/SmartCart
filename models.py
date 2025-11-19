from flask_login import UserMixin


class Usuario(UserMixin):
    def __init__(self, id, nome, cpf, telefone, email, senha):
        self.id = id
        self.nome = nome
        self.cpf = cpf
        self.telefone = telefone
        self.email = email
        self.senha = senha

class Produto():
    def __init__ (self, id, nome, preco, estoque, id_imagem):
        self.id = id
        self.nome = nome
        self.preco = preco
        self.estoque = estoque
        self.id_imagem = id_imagem

