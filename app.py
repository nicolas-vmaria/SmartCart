from flask import Flask, render_template, request, redirect, url_for
import mysql.connector
from models import Usuario, Produto
from flask_login import (
    LoginManager,
    login_required,
    login_user,
    logout_user,
    current_user,
)
import hashlib

app = Flask(__name__)
app.secret_key = "chaveteste"
lm = LoginManager(app)

conexao = mysql.connector.connect(
    host="localhost", user="root", password="", port="3406", database="smartcart"
)
cursor = conexao.cursor(dictionary=True)


def hash(txt):
    hash_obj = hashlib.sha256(txt.encode("utf-8"))
    return hash_obj.hexdigest()


@lm.user_loader
def user_loader(id):
    cursor.execute("SELECT * FROM Usuario WHERE id = %s", (id,))
    usuario = cursor.fetchone()
    if usuario:
        return Usuario(
            usuario["id"], usuario["nome"], usuario["cpf"], usuario["telefone"], usuario["email"], usuario["senha"]
        )


@app.route("/")
def index():
    return render_template("index.html", user=current_user)


@app.route("/sobre")
def sobre():
    return render_template("sobre.html", user=current_user)


@app.route("/orcamento")
def orcamento():
    return render_template("orcamento.html", user=current_user)


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("index"))


@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    if request.method == "GET":
        return render_template("cadastro.html")
    elif request.method == "POST":
        nome = request.form["nome"]
        cpf = request.form["cpf"].replace(".", "").replace("-", "")
        telefone = (
            request.form["tel"]
            .replace("(", "")
            .replace(")", "")
            .replace("-", "")
            .replace(" ", "")
        )
        email = request.form["email"]
        senha = request.form["senha"]

        cursor.execute(
            "SELECT * FROM Usuario WHERE cpf = %s OR email = %s",
            (cpf, email),
        )
        usuario_existente = cursor.fetchone() 

        if usuario_existente:
            erro = "Usuário já cadastrado"
            return redirect(f"/cadastro?erro={erro}")

        cursor.execute(
            "INSERT INTO Usuario (nome, cpf, telefone, email, senha) VALUES (%s, %s, %s, %s, %s)",
            (nome, cpf, telefone, email, hash(senha)),
        )
        conexao.commit()
        new_user = Usuario(cursor.lastrowid, nome, cpf, telefone, email, hash(senha))
        login_user(new_user)

        return redirect(url_for("index"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        cpf = request.form["cpf"].replace("-", "").replace(".", "")
        senha = request.form["senha"]

        cursor.execute(
            "SELECT * FROM Usuario WHERE cpf = %s AND senha = %s", (cpf, hash(senha))
        )
        usuario = cursor.fetchone()

        if usuario:
            user = Usuario(
                usuario["id"], usuario["nome"], usuario["cpf"], usuario["telefone"], usuario["email"], usuario["senha"]
            )
            login_user(user)
            return redirect(url_for("index"))
        else:
            erro = "CPF ou senha incorretos"
            return redirect(f"/login?erro={erro}")


@app.route("/produtos")
def listar_produtos():
    cursor.execute("SELECT * FROM produtos")
    produtos = cursor.fetchall()
    return render_template("produto.html", user=current_user, produtos=produtos)


if __name__ == "__main__":
    app.run(debug=True)
