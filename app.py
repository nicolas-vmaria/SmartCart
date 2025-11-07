import os
from flask import Flask, render_template, request, redirect, session, jsonify
import mysql.connector

app = Flask(__name__)

conexao = mysql.connector.connect(
    host="localhost", port="3406", user="root", password="", database="SmartCart"
)
cursor = conexao.cursor(dictionary=True)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/sobre")
def sobre():
    return render_template("sobre.html")


@app.route("/cadastro", methods=["GET", "POST"])
def cadastro():
    if request.method == "POST":
        nome = request.form["nome"]
        email = request.form["email"]
        senha = request.form["senha"]

        cursor.execute(
            "INSERT INTO Usuarios (nome, email, senha, admin) VALUES (%s, %s, %s, 0)",
            (nome, email, senha),
        )
        conexao.commit()

        usuario_id = cursor.lastrowid

        session["usuario_id"] = usuario_id
        session["usuario_nome"] = nome

        return redirect("/produtos")

    return render_template("cadastro.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":

        email = request.form["email"]
        senha = request.form["senha"]

        cursor.execute("SELECT * FROM Usuarios WHERE email=%s", (email,))
        user = cursor.fetchone()

        if not user:

            erro = "Usuário não encontrado. Cadastre-se primeiro."
            return redirect(f"/cadastro?erro={erro}")

        if user["senha"] != senha:
            erro = "Senha incorreta. Tente Novamente."
            return redirect(f"/login?erro={erro}")

        session["usuario_id"] = user["id"]
        session["usuario_nome"] = user["nome"]

        return redirect("/produtos")

    return render_template("login.html")


if __name__ == "__main__":
    app.run(debug=True)
