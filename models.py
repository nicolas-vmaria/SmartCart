from flask_login import UserMixin

class Usuario(UserMixin):
    def __init__(self, id, nome, cpf, telefone, gmail, senha):
        self.id = id
        self.nome = nome
        self.cpf = cpf
        self.telefone = telefone
        self.gmail = gmail
        self.senha = senha
