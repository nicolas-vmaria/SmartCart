from flask import Flask, render_template, request, redirect, url_for
from db import db
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from models import Usuario, Produto
from flask_login import (
    LoginManager,
    login_required,
    login_user,
    logout_user,
    current_user,
)
import hashlib

admin = Admin()


def init_app(app):
    admin.name = "Loja de Informática Admin"
    admin.template_mode = None
    admin.init_app(app)


app = Flask(__name__)
app.secret_key = "chaveteste"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
db.init_app(app)
admin.init_app(app)
lm = LoginManager(app)

admin.add_view(ModelView(Produto, db.session))
admin.add_view(ModelView(Usuario, db.session))


def hash(txt):
    hash_obj = hashlib.sha256(txt.encode("utf-8"))
    return hash_obj.hexdigest()


@lm.user_loader
def user_loader(id):
    usuario = db.session.query(Usuario).filter_by(id=id).first()
    return usuario


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

        usuario_existente = Usuario.query.filter(
            (Usuario.cpf == cpf) | (Usuario.email == email)
        ).first()

        if usuario_existente:
            erro = "CPF ou E-mail já cadastrado"
            return redirect(f"/cadastro?erro={erro}")
        else:
            new_user = Usuario(
                nome=nome, cpf=cpf, telefone=telefone, email=email, senha=hash(senha)
            )

            db.session.add(new_user)
            db.session.commit()
            login_user(new_user)

            return redirect(url_for("index"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        cpf = request.form["cpf"].replace("-", "").replace(".", "")
        senha = request.form["senha"]

        usuario = Usuario.query.filter_by(cpf=cpf, senha=hash(senha)).first()

        if usuario:
            login_user(usuario)
            return redirect(url_for("index"))
        else:
            erro = "CPF ou senha incorretos"
            return redirect(f"/login?erro={erro}")


@app.route("/produtos")
def listar_produtos():
    produtos = db.session.query(Produto).all()
    return render_template("produto.html", user=current_user, produtos=produtos)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
