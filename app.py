import os
from flask import Flask, render_template, request, redirect
from models import Usuario
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import mysql.connector
import hashlib

app = Flask(__name__)
app.secret_key = "chaveteste"
lm = LoginManager(app)


def hash(txt):
    hash_obj = hashlib.sha256(txt.encode('utf-8'))
    return hash_obj.hexdigest()

@lm.user_loader
def load_user(id):
    cursor.execute("SELECT * FROM Usuarios WHERE id=%s", (id,))
    resultado = cursor.fetchone()
    if resultado:
        return Usuario(resultado['id'], resultado['nome'], resultado['cpf'], resultado['telefone'], resultado['email'], resultado['senha'])


conexao = mysql.connector.connect(
    host="localhost", port="3406", user="root", password="", database="SmartCart"
)
cursor = conexao.cursor(dictionary=True)


@app.route("/")

def index():
    return render_template("produto.html")

@app.route("/sobre")

def sobre():
    return render_template("sobre.html")

@app.route("/logout")

def logout():
    logout_user()
    return redirect("/")


@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    if request.method == "GET":
        return render_template("/cadastro.html")
    elif request.method == "POST":
        nome = request.form["nome"]
        cpf = request.form["cpf"].replace(".", "").replace("-", "")
        telefone = request.form["telefone"]
        email = request.form["email"]
        senha = request.form["senha"]

        cursor.execute("SELECT * FROM Usuarios WHERE cpf=%s OR email=%s", (cpf, email))
        usuario_existente = cursor.fetchone()

        if usuario_existente:
            erro = "CPF ou E-mail já cadastrado"
            return redirect(f"/cadastro?erro={erro}")
        else:
            cursor.execute(
                "INSERT INTO Usuarios (nome, cpf, telefone, email, senha) VALUES (%s, %s, %s, %s, %s)",
                (nome, cpf, telefone, email, hash(senha)),
            )
            conexao.commit()

            new_user = Usuario(cursor.lastrowid, nome, cpf, telefone, email, senha)
            login_user(new_user)
            
            return redirect("/")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("/login.html")
    elif request.method == "POST":
        cpf = request.form["cpf"].replace("-", "").replace(".", "")
        senha = request.form["senha"]

        cursor.execute("SELECT * FROM Usuarios WHERE cpf=%s AND senha=%s", (cpf, hash(senha)))
        user_old = cursor.fetchone()


        if user_old:
            user = Usuario(user_old['id'], user_old['nome'], user_old["cpf"], user_old["telefone"], user_old["email"], user_old['senha'])
            login_user(user)
            return redirect("/")
        else:
            erro = "Senha ou nome já cadastrado"
            return redirect(f"/login?erro={erro}")

def buscar_categorias():
    cursor.execute(
        "SELECT DISTINCT categoria FROM Produtos WHERE categoria IS NOT NULL AND categoria <> ''"
    )
    rows = cursor.fetchall()
    return [r["categoria"] for r in rows]


@app.route("/produtos")

def listar_produtos():
    cursor.execute("SELECT * FROM Produtos ORDER BY nome ASC")
    produtos = cursor.fetchall()
    categorias = buscar_categorias()
    return render_template("produtos.html", produtos=produtos, categorias=categorias)


# -----------------------------
# Filtrar por categoria
# -----------------------------
@app.route("/categoria/<categoria>")

def produtos_por_categoria(categoria):
    cursor.execute("SELECT * FROM Produtos WHERE categoria=%s", (categoria,))
    produtos = cursor.fetchall()
    categorias = buscar_categorias()
    return render_template(
        "produtos.html",
        produtos=produtos,
        categorias=categorias,
        categoria_atual=categoria,
    )

if __name__ == "__main__":
    app.run(debug=True)
