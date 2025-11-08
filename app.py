import os
from flask import Flask, render_template, request, redirect
from models import Usuario
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import mysql.connector
import hashlib

app = Flask(__name__)
app.secret_key = "chaveteste"
lm = LoginManager(app)
lm.login_view = "login"

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
@login_required
def index():
    return render_template("index.html")

@app.route("/sobre")
@login_required
def sobre():
    return render_template("sobre.html")

@app.route("/logout")
@login_required
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
            return "Senha ou nome incorreto" , 401


if __name__ == "__main__":
    app.run(debug=True)
