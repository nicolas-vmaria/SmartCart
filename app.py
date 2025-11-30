from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
import smtplib
import email.message
from models import Usuario, Payload
from flask_login import (
    LoginManager,
    login_required,
    login_user,
    logout_user,
    current_user,
)

import hashlib
import re
import qrcode
import crcmod

app = Flask(__name__)
app.secret_key = "chaveteste"
lm = LoginManager(app)

conexao = mysql.connector.connect(
    host="localhost", user="root", password="12345678", port="3306", database="smart_cart"
)
cursor = conexao.cursor(dictionary=True)


def hash(txt):
    hash_obj = hashlib.sha256(txt.encode("utf-8"))
    return hash_obj.hexdigest()


# Criptogrando a senha do admin
# senha_admin = "admin123"
# objeto_hash = hashlib.sha256()
# objeto_hash.update(senha_admin.encode("utf-8"))
# senha_admin = objeto_hash.hexdigest()
# print(senha_admin)


@lm.user_loader
def user_loader(id):
    cursor.execute("SELECT * FROM Usuario WHERE id = %s", (id,))
    usuario = cursor.fetchone()
    if usuario:
        return Usuario(
            usuario["id"],
            usuario["nome"],
            usuario["cnpj"],
            usuario["telefone"],
            usuario["email"],
            usuario["senha"],
            usuario["is_admin"],
        )


@lm.unauthorized_handler
def unauthorized():
    if request.endpoint == "orcamento":
        flash(
            "Entre na sua conta ou cadastre-se, para fazer orçamentos conosco!", "erro"
        )
    elif request.endpoint == "contato":
        flash("Entre na sua conta ou cadastre-se, para fazer contato conosco!", "erro")

    return redirect(url_for("login"))


@app.route("/")
def index():
    return render_template("index.html", user=current_user)

@app.route("/produto/<int:id>")
def detalhes_produto(id):
    # 1. Busca o produto específico pelo ID
    # Ajuste o ? ou %s dependendo do seu banco (SQLite usa ?, MySQL usa %s)
    cursor.execute("SELECT * FROM Produtos WHERE id = %s", (id,)) 
    produto = cursor.fetchone()

    # Se não achar o produto, redireciona ou mostra erro 404
    if not produto:
        return "Produto não encontrado", 404

    # 2. Renderiza a nova página passando os dados desse produto
    return render_template(
        "detalhes_produto.html",
        produto=produto,
        user=current_user # Mantém o user para o header funcionar
    )


@app.route("/pagamento/<int:id>")
@login_required
def pagamento(id):
    cursor.execute(
        "select * from Pedidos where id = %s and id_usuario = %s", (id, current_user.id)
    )
    pedido = cursor.fetchone()

    if not pedido:
        flash("Pedido não encontrado.", "erro")
        return redirect(url_for("pedidos"))
    
    try:
        if 'preco_unitario' not in pedido or 'quantidade' not in pedido:
            raise ValueError("O pedido não contém informações de preço ou quantidade.")
    
        valor_total = float(pedido['preco_unitario']) * int(pedido['quantidade'])
    except Exception as e:
        flash(f"Erro ao calcular o valor do pedido: {e}", "erro")
        return redirect(url_for("pedidos"))
    
    CHAVE_PIX = "09425859922"
    NOME_RECEBEDOR = "SmartCart Vendas"
    CIDADE_RECEBEDOR = "Joiville"
    TXID = f"PEDIDO{pedido['id']}"
    nome_arquivo_imagem = f"pix_pedido_{pedido['id']}.png"

    try:
        gerador = Payload(
            nome=NOME_RECEBEDOR,
            chavepix=CHAVE_PIX,
            valor=f"{valor_total:.2f}",
            cidade=CIDADE_RECEBEDOR,
            txtId=TXID,
            diretorio="static",
            nome_arquivo=nome_arquivo_imagem
        )

        gerador.gerarPayload()

        img_path = url_for("static", filename=nome_arquivo_imagem)

    except Exception as e:
        flash(f"Erro ao gerar o QR Code PIX: {e}", "erro")
        return redirect(url_for("pedidos"))


    return render_template("pagamento.html", user=current_user, pedido=pedido, img_path=img_path, valor_total=valor_total)

@app.route("/pagamento_realizado/<int:id>")
@login_required
def pagamento_realizado(id):
    cursor.execute(
        "UPDATE Pedidos SET status = %s WHERE id = %s AND id_usuario = %s",
        ("Pago", id, current_user.id),
    )
    conexao.commit()

    flash("Pagamento realizado com sucesso!", "sucesso")
    return redirect(url_for("pedidos"))


@app.route("/excluir_pedido/<int:id>")
@login_required
def excluir_pedido(id):
    cursor.execute(
        "DELETE FROM Pedidos WHERE id = %s AND id_usuario = %s", (id, current_user.id)
    )
    conexao.commit()

    flash("Pedido excluído com sucesso!", "sucesso")
    return redirect(url_for("pedidos"))


@app.route("/admin/criar_usuario", methods=["POST"])
@login_required
def criar_usuario():
    nome = request.form["nome"]
    cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
    telefone = (
        request.form["tel"]
        .replace("(", "")
        .replace(")", "")
        .replace("-", "")
        .replace(" ", "")
    )
    email = request.form["email"]
    senha = request.form["senha"]

    objeto_hash = hashlib.sha256()
    objeto_hash.update(senha.encode("utf-8"))
    senha_criptografada = objeto_hash.hexdigest()

    cursor.execute(
        "SELECT * FROM Usuario WHERE cnpj = %s OR email = %s",
        (cnpj, email),
    )
    usuario_existente = cursor.fetchone()

    if usuario_existente:
        erro = "Usuário já cadastrado"
        return redirect(f"/admin/criar_usuario?erro={erro}")

    cursor.execute(
        "INSERT INTO Usuario (nome, cnpj, telefone, email, senha, is_admin) VALUES (%s, %s, %s, %s, %s, %s)",
        (nome, cnpj, telefone, email, senha_criptografada, True),
    )
    conexao.commit()

    flash("Usuario criado com sucesso!", "sucesso")
    return redirect(url_for("admin_users"))


@app.route("/excluir_usuario/<int:id>")
@login_required
def excluir_usuario(id):
    cursor.execute("DELETE FROM Pedidos WHERE id_usuario = %s", (id,))
    cursor.execute("DELETE FROM Orcamentos WHERE id_usuario = %s", (id,))
    cursor.execute("DELETE FROM Usuario WHERE id = %s", (id,))
    conexao.commit()

    flash("Usuario excluído com sucesso!", "sucesso")
    return redirect(url_for("admin_users"))


@app.route("/editar_usuario/<int:id>", methods=["POST"])
@login_required
def editar_usuario(id):
    nome = request.form["nome"]
    cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
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
        "UPDATE Usuario SET nome=%s, cnpj=%s, telefone=%s, email=%s, senha=%s WHERE id = %s",
        (nome, cnpj, telefone, email, senha, id),
    )
    conexao.commit()

    flash("Usuario atualizado com sucesso!", "sucesso")
    return redirect(url_for("admin_users"))

 
app.route("/admin/criar_produto", methods=["POST"])
@login_required
def criar_produto():
    nome = request.form["nome"]
    preco = request.form["preco"]
    estoque = request.form["estoque"]
    id_imagem = request.form["id_imagem"]

    cursor.execute(
        "INSERT INTO Produtos (nome, preco, estoque, id_imagem) VALUES (%s, %s, %s, %s)",
        (nome, preco, estoque, id_imagem),
    )
    conexao.commit()

    flash("Produto criado com sucesso!", "sucesso")
    return redirect(url_for("admin_produtos"))


@app.route("/excluir_produto/<int:id>")
@login_required
def excluir_produto(id):
    cursor.execute("DELETE FROM Pedidos WHERE id_produto = %s", (id,))
    cursor.execute("DELETE FROM Orcamentos WHERE id_produto = %s", (id,))
    cursor.execute("DELETE FROM Produtos WHERE id = %s", (id,))
    conexao.commit()

    flash("Produto excluído com sucesso!", "sucesso")
    return redirect(url_for("admin_produtos"))


@app.route("/editar_produto/<int:id>", methods=["POST"])
@login_required
def editar_produto(id):
    nome = request.form["nome"]
    preco = request.form["preco"]
    estoque = request.form["estoque"]
    id_imagem = request.form["id_imagem"]

    cursor.execute(
        "UPDATE Produtos SET nome=%s, preco=%s, estoque=%s, id_imagem=%s WHERE id = %s",
        (nome, preco, estoque, id_imagem, id),
    )
    conexao.commit()

    flash("Produto atualizado com sucesso!", "sucesso")
    return redirect(url_for("admin_produtos"))


@app.route("/admin/")
@login_required
def admin():
    if not current_user.is_admin:
        flash("Acesso negado: Você não tem permissões de administrador.", "erro")
        return redirect(url_for("index"))

    cursor.execute("SELECT COUNT(*) AS total_usuarios FROM Usuario WHERE is_admin = 0")
    total_usuarios = cursor.fetchone()["total_usuarios"]
    cursor.execute("SELECT COUNT(*) AS total_produtos FROM Produtos")
    total_produtos = cursor.fetchone()["total_produtos"]
    cursor.execute(
        "SELECT COUNT(*) AS total_pedidos FROM Pedidos WHERE status = 'Pendente'"
    )
    total_pedidos = cursor.fetchone()["total_pedidos"]

    return render_template(
        "adminPage.html",
        user=current_user,
        total_usuarios=total_usuarios,
        total_produtos=total_produtos,
        total_pedidos=total_pedidos,
    )


@app.route("/admin/users")
@login_required
def admin_users():
    if not current_user.is_admin:
        flash("Acesso negado: Você não tem permissões de administrador.", "erro")
        return redirect(url_for("index"))

    cursor.execute("SELECT * FROM Usuario WHERE is_admin = 0")
    usuarios = cursor.fetchall()

    return render_template("usersAdmin.html", user=current_user, usuarios=usuarios)


@app.route("/admin/produtos")
@login_required
def admin_produtos():
    if not current_user.is_admin:
        flash("Acesso negado: Você não tem permissões de administrador.", "erro")
        return redirect(url_for("index"))

    cursor.execute("SELECT * FROM Produtos")
    produtos = cursor.fetchall()

    return render_template("produtosAdmin.html", user=current_user, produtos=produtos)


@app.route("/admin/orcamentos")
@login_required
def admin_orcamentos():
    if not current_user.is_admin:
        flash("Acesso negado: Você não tem permissões de administrador.", "erro")
        return redirect(url_for("index"))
    
    cursor.execute("SELECT * FROM Orcamentos")
    orcamentos = cursor.fetchall()

    return render_template("orcamentosAdmin.html", user=current_user, orcamentos=orcamentos)


@app.route("/conta")
@login_required
def conta():
    # Passa o usuário atual para o template
    return render_template("conta.html", user=current_user)


@app.route("/conta/update", methods=["PUT"])
@login_required
def conta_update():

    # Verifica se o que o JS enviou é um JSON
    if not request.is_json:
        return jsonify({"message": "Erro: Requisição deve ser JSON"}), 415

    try:
        data = request.get_json()

        allowed_fields = {
            "nome": "nome",
            "telfone": "telefone",
            "email": "email",
            "senha": "senha",
        }

        updates = {}

        for js_key, db_field in allowed_fields.items():
            if js_key in data:
                value = data[js_key]

                # Se o valor for vazio, pula (segurança extra)
                if not value:
                    continue

                if js_key == "telfone":
                    value = re.sub(r"\D", "", value)

                # --- CORREÇÃO AQUI ---
                if js_key == "senha":
                    # Usamos o mesmo padrão SHA-256 do login e cadastro
                    objeto_hash = hashlib.sha256()
                    objeto_hash.update(value.encode("utf-8"))
                    value = objeto_hash.hexdigest()
                # ---------------------

                updates[db_field] = value

        if not updates:
            # Se o JS não enviou nada (caso raro, pois o JS já verifica)
            return jsonify({"message": "Nenhum dado para atualizar."}), 400

        # 2. Monta a Query SQL Dinâmica
        # Isso cria a parte "SET nome = %s, email = %s"
        set_clause = ", ".join([f"{field} = %s" for field in updates.keys()])

        # Cria a lista de valores na ordem correta
        values = list(updates.values())
        values.append(current_user.id)  # Adiciona o ID do usuário no final

        # Query final
        query = f"UPDATE Usuario SET {set_clause} WHERE id = %s"

        # 3. AQUI ESTÁ A EXECUÇÃO NO DB

        cursor.execute(query, tuple(values))

        # 4. Atualiza o objeto current_user na sessão com os novos dados
        if "telefone" in updates:
            current_user.telefone = updates["telefone"]
        if "nome" in updates:
            current_user.nome = updates["nome"]
        if "email" in updates:
            current_user.email = updates["email"]
        if "senha" in updates:
            # AQUI: Se a senha foi atualizada, use o valor JÁ HASHADO de 'updates["senha"]'
            current_user.senha = updates["senha"]

        conexao.commit()

        # 5. Retorna sucesso para o JavaScript
        return jsonify({"message": "Perfil atualizado com sucesso!"}), 200

    except Exception as e:
        # Se der erro no DB
        print(f"Erro na atualização de conta: {e}")  # Bom para debug
        conexao.rollback()  # Desfaz qualquer mudança no DB
        return jsonify({"message": "Erro interno ao atualizar o banco de dados."}), 500


@app.route("/sobre")
def sobre():
    return render_template("sobre.html", user=current_user)


@app.route("/termos")
def termos():
    return render_template("termos.html", user=current_user)


@app.route("/pedidos")
@login_required
def pedidos():
    cursor.execute(
        """
        SELECT 
            p.id,
            p.nome_produto,        
            p.quantidade,
            p.preco_unitario,     
            p.status,
            p.data_pedido,
            p.id_orcamento,
            pr.id_imagem AS produto_imagem, -- A imagem ainda buscamos da tabela de produtos original
            (p.preco_unitario * p.quantidade) AS total_item
        FROM Pedidos p
        JOIN Produtos pr ON p.id_produto = pr.id
        JOIN Orcamentos o ON p.id_orcamento = o.id
        WHERE p.id_usuario = %s
        ORDER BY p.data_pedido DESC
        """,
        (current_user.id,),
    )
    pedidos = cursor.fetchall()

    return render_template("pedidos.html", user=current_user, pedidos=pedidos)


@app.route("/orcamento", methods=["GET", "POST"])
@login_required
def orcamento():
    if request.method == "GET":
        produto_id = request.args.get("produto_id", type=int)

        cursor.execute("SELECT * FROM Produtos ORDER BY nome")
        produtos = cursor.fetchall()

        if not produtos:
            flash("Nenhum produto disponível para orçamento no momento.", "erro")
            return redirect(url_for("index"))

        return render_template("orcamento.html", user=current_user, produtos=produtos, produto_id=produto_id)
    elif request.method == "POST":
        nome_empresa = request.form["nomeEmpresa"]
        cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
        email = request.form["email"]
        endereco = request.form["endereco"]
        numero = request.form["numero"]
        complemento = request.form["complemento"]
        cep = request.form["cep"].replace("-", "")
        id_produto = request.form["produtos"]
        quantidades = request.form["quantidades"].replace(".", "")
        prazo_entrega = request.form["prazo"]

        cursor.execute("SELECT nome, preco FROM Produtos WHERE id = %s", (id_produto,))
        produto_info = cursor.fetchone()

        if not produto_info:
            flash("Produto inválido selecionado.", "erro")
            return redirect(url_for("orcamento"))

        preco = produto_info["preco"]
        nome_produto = produto_info["nome"]

        

        cursor.execute(
            "INSERT INTO Orcamentos (id_usuario, id_produto, nome_empresa, cnpj, email, endereco, numero, complemento, cep, nome_produto, quantidades, prazo_entrega) VALUES ( %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (
                current_user.id,
                id_produto,
                nome_empresa,
                cnpj,
                email,
                endereco,
                numero,
                complemento,
                cep,
                nome_produto,
                quantidades,
                prazo_entrega,
            ),
        )
        conexao.commit()


        id_orcamento = cursor.lastrowid

        cursor.execute(
            "INSERT INTO Pedidos (id_usuario, id_produto, id_orcamento, nome_produto, quantidade, preco_unitario, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (
                current_user.id,
                id_produto,
                id_orcamento,
                nome_produto,
                quantidades,
                preco,
                "Pendente",
            ),
        )
        conexao.commit()

        flash("Orçamento enviado com sucesso!", "sucesso")
        return redirect(url_for("index"))


@app.route("/contato", methods=["GET", "POST"])
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
        msg["Subject"] = f"{assunto}"
        msg["From"] = "SmartCart <pyhonprojetos@gmail.com>"
        msg["To"] = "smartcart.contato@gmail.com"
        password = "mearjauclzstlewo"
        msg.add_header("Content-Type", "text/html")
        msg.set_payload(corpo_email)

        s = smtplib.SMTP("smtp.gmail.com: 587")
        s.starttls()
        s.login("pyhonprojetos@gmail.com", password)
        s.sendmail(
            "pyhonprojetos@gmail.com", [msg["To"]], msg.as_string().encode("utf-8")
        )

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
        cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
        telefone = (
            request.form["tel"]
            .replace("(", "")
            .replace(")", "")
            .replace("-", "")
            .replace(" ", "")
        )
        email = request.form["email"]
        senha = request.form["senha"]

        objeto_hash = hashlib.sha256()
        objeto_hash.update(senha.encode("utf-8"))
        senha_criptografada = objeto_hash.hexdigest()

        cursor.execute(
            "SELECT * FROM Usuario WHERE cnpj = %s OR email = %s",
            (cnpj, email),
        )
        usuario_existente = cursor.fetchone()

        if usuario_existente:
            erro = "Usuário já cadastrado"
            return redirect(f"/cadastro?erro={erro}")

        cursor.execute(
            "INSERT INTO Usuario (nome, cnpj, telefone, email, senha) VALUES (%s, %s, %s, %s, %s)",
            (nome, cnpj, telefone, email, senha_criptografada),
        )
        conexao.commit()
        new_user = Usuario(
            cursor.lastrowid, nome, cnpj, telefone, email, senha_criptografada
        )
        login_user(new_user)

        return redirect(url_for("index"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("login.html")
    elif request.method == "POST":
        cnpj = request.form["cnpj"].replace(".", "").replace("/", "").replace("-", "")
        senha = request.form["senha"]

        objeto_hash = hashlib.sha256()
        objeto_hash.update(senha.encode("utf-8"))
        senha_verificada = objeto_hash.hexdigest()

        cursor.execute(
            "SELECT * FROM Usuario WHERE cnpj = %s AND senha = %s",
            (cnpj, senha_verificada),
        )
        usuario = cursor.fetchone()

        if usuario:
            user = Usuario(
                usuario["id"],
                usuario["nome"],
                usuario["cnpj"],
                usuario["telefone"],
                usuario["email"],
                usuario["senha"],
                usuario["is_admin"],
            )
            login_user(user)

            if user.is_admin:
                return redirect(url_for("admin"))

            return redirect(url_for("index"))
        else:
            erro = "CPF ou senha incorretos"
            return redirect(f"/login?erro={erro}")


@app.route("/produtos")
def listar_produtos():
    # 1. Busca os dados do banco
    cursor.execute("SELECT * FROM Produtos")
    produtos_db = cursor.fetchall()

    # Transforma em lista para podermos ordenar no Python
    produtos_lista = list(produtos_db)

    # 2. Pega o filtro selecionado na URL
    sort_option = request.args.get("sort", "recommended")

    # 3. Ordena a lista no Python antes de enviar
    # NOTA: Verifique se no seu banco a coluna se chama 'preco', 'price' ou é um índice numérico
    if sort_option == "price-low":
        produtos_lista.sort(key=lambda x: x["preco"])
    elif sort_option == "price-high":
        produtos_lista.sort(key=lambda x: x["preco"], reverse=True)

    # 4. Renderiza
    return render_template(
        "produto.html",
        user=current_user,
        produtos=produtos_lista,
        current_sort=sort_option,
    )

@app.route("/produtos/<int:id>")
@login_required
def produto_detalhes(id):
    cursor.execute("SELECT * FROM Produtos WHERE id = %s", (id,))
    produto = cursor.fetchone()

    if not produto:
        flash("Produto não encontrado.", "erro")
        return redirect(url_for("listar_produtos"))

    return render_template("detalhes_produto.html", user=current_user, produto=produto)


if __name__ == "__main__":
    app.run(debug=True)
