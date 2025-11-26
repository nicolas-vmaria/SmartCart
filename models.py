from flask_login import UserMixin


class Usuario(UserMixin):
    def __init__(self, id, nome, cnpj, telefone, email, senha, is_admin=False):
        self.id = id
        self.nome = nome
        self.cnpj = cnpj
        self.telefone = telefone
        self.email = email
        self.senha = senha
        self.is_admin = is_admin

        self.primeiro_nome = nome.strip().split(" ")[0]