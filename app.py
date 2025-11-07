import os
from flask import Flask, render_template, request, redirect
from models import Usuario
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
import mysql.connector

app = Flask(__name__)
app.secret_key = "chaveteste"
lm = LoginManager(app)

@lm.user_loader
def load_user(id):
    cursor.execute("SELECT * FROM Usuarios WHERE id=%s", (id,))
    resultado = cursor.fetchone()
    user = Usuario
    return user(resultado["id"])


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
        telefone = request.form["telefone"]
        cpf = request.form["cpf"]
        email = request.form["email"]
        senha = request.form["senha"]

        cursor.execute(
            "INSERT INTO Usuarios (nome, telefone, cpf, email, senha) VALUES (%s, %s, %s, %s, %s)",
            (nome, telefone, cpf, email, senha),
        )
        cursor.fetchone()
        conexao.commit()

        new_user = Usuario(cursor.lastrowid, nome, telefone, cpf, email, senha)
        login_user(new_user)
        
        return render_template("/index.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("/login.html")
    elif request.method == "POST":
        cpf = request.form["cpf"]
        senha = request.form["senha"]

        cursor.execute("SELECT * FROM Usuarios WHERE cpf=%s AND senha=%s", (cpf, senha))
        user = cursor.fetchone()

        if user:
            User = Usuario
            login_user(User(user["id"], user["cpf"], user["senha"]))
            return redirect("/")
        else:
            return redirect("/login", erro="Senha ou CPF incorretos")


if __name__ == "__main__":
    app.run(debug=True)
