from flask_login import UserMixin


class Usuario(UserMixin):
    def __init__(self, id, nome, cpf, telefone, email, senha):
        self.id = id
        self.nome = nome
        self.cpf = cpf
        self.telefone = telefone
        self.email = email
        self.senha = senha

        self.primeiro_nome = nome.strip().split(" ")[0]