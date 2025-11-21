from flask import Flask, render_template, request, redirect, url_for, flash
import mysql.connector
import smtplib
import email.message
from models import Usuario
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
    
@lm.unauthorized_handler
def unauthorized():
    if request.endpoint == "orcamento":
        flash("Entre na sua conta ou cadastre-se, para fazer orçamentos conosco!", "erro")
    elif request.endpoint == "contato":
        flash("Entre na sua conta ou cadastre-se, para fazer contato conosco!", "erro")
    return redirect(url_for("login"))
    


@app.route("/")
def index():
    return render_template("index.html", user=current_user)


@app.route("/sobre")
def sobre():
    return render_template("sobre.html", user=current_user)


@app.route("/orcamento", methods=["GET", "POST"])
@login_required
def orcamento():
    if request.method == "GET":
        cursor.execute("SELECT * FROM Produtos ORDER BY nome")
        produtos = cursor.fetchall()
        return render_template("orcamento.html", user=current_user, produtos=produtos)
    elif request.method == "POST":
        nome_empresa = request.form["nomeEmpresa"]
        cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
        email = request.form["email"]
        endereco = request.form["endereco"]
        numero = request.form["numero"]
        complemento = request.form["complemento"]
        cep = request.form["cep"].replace("-", "")
        produtos = request.form["produtos"]
        quantidades = request.form["quantidades"]
        prazo_entrega = request.form["prazo"]
        forma_pagamento = request.form["forma_pagamento"]
        numero_parcelas = request.form.get("parcelas")
        entrada = request.form["entrada"].replace("R$ ", "").replace(".", "")

        cursor.execute(
            "INSERT INTO Orcamentos (nome_empresa, cnpj, email, endereco, numero, complemento, cep, produtos, quantidades, prazo_entrega, forma_pagamento, numero_parcelas, entrada) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (nome_empresa, cnpj, email, endereco, numero, complemento, cep, produtos, quantidades, prazo_entrega, forma_pagamento, numero_parcelas, entrada),
        )
        conexao.commit()

        flash("Orçamento enviado com sucesso!", "sucesso")
        return redirect(url_for("index"))

        
@app.route("/contato", methods=["GET", "POST"])
@login_required
def contato():
    if request.method == "GET":
        return render_template("contato.html", user=current_user) 
    elif request.method == "POST":
        nome = request.form["nome"]
        gmail = request.form["email"]
        assunto = request.form["assunto"]
        mensagem = request.form.get("mensagem")


        cursor.execute(
            "INSERT INTO Contatos (nome, email, assunto, mensagem) VALUES (%s, %s, %s, %s)",
            (nome, gmail, assunto, mensagem),
        )
        conexao.commit()

        corpo_email = f"""
        <p><b>Nome:</b> {nome}</p>
        <p><b>Email:</b> {gmail}</p>
        <p>Mensegem:</b></p>
        <p>{mensagem}</p>
        """

        msg = email.message.Message()
        msg['Subject'] = f"{assunto}"
        msg['From'] = 'pyhonprojetos@gmail.com'
        msg['To'] = 'boing.caio@gmail.com'
        password = 'mearjauclzstlewo' 
        msg.add_header('Content-Type', 'text/html')
        msg.set_payload(corpo_email )

        s = smtplib.SMTP('smtp.gmail.com: 587')
        s.starttls()
        s.login(msg['From'], password)
        s.sendmail(msg['From'], [msg['To']], msg.as_string().encode('utf-8'))

        flash("Mensagem enviada com sucesso!", "sucesso")
        return redirect(url_for("index"))


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
    cursor.execute("SELECT * FROM Produtos")
    produtos = cursor.fetchall()
    return render_template("produto.html", user=current_user, produtos=produtos)


if __name__ == "__main__":
    app.run(debug=True)
