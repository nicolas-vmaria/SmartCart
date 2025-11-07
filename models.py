from flask_login import UserMixin

class Usuario(UserMixin):
    def __init__(self, id, nome, telefone, cpf, gmail, senha):
        self.id = id
        self.nome = nome
        self.telefone = telefone
        self.cpf = cpf
        self.gmail = gmail
        self.senha = senha
