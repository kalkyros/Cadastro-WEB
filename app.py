from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3, os
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography import fernet
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configurações com valores padrão (seguros o suficiente para desenvolvimento)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY") or os.urandom(24)
DATABASE_PATH = os.getenv("DATABASE_PATH") or os.path.join(os.path.dirname(__file__), "database.db")

# FERNET (opcional): se a variável de ambiente estiver presente, usaremos para criptografar o CPF
FERNET_KEY = os.getenv("FERNET_KEY")
cipher = None
if FERNET_KEY:
    try:
        # A chave vem como string do .env; Fernet espera bytes
        cipher = fernet.Fernet(FERNET_KEY.encode())
    except Exception:
        cipher = None
        app.logger.warning("FERNET_KEY inválida ou malformada — criptografia de CPF desativada.")


def criar_bd():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS usuarios ("
        "id INTEGER PRIMARY KEY AUTOINCREMENT, "
        "nome TEXT NOT NULL, "
        "email TEXT NOT NULL UNIQUE, "
        "telefone TEXT NOT NULL, "
        "cpf TEXT NOT NULL, "
        "data_nascimento TEXT NOT NULL, "
        "senha TEXT NOT NULL)"
    )
    conn.commit()
    conn.close()


criar_bd()


@app.route("/")
def homePage():
    # Página de registro
    return render_template("cadastro.html")


@app.route("/cadastrar", methods=["POST"])
def cadastrar():
    nome = request.form.get("nome")
    email = request.form.get("email")
    telefone = request.form.get("telefone")
    cpf = request.form.get("cpf", "")
    data_nascimento = request.form.get("data_Nascimento")
    senha_hash = generate_password_hash(request.form.get("senha"))

    # criptografa o CPF se o cipher estiver disponível
    cpf_stored = cpf
    if cipher:
        try:
            cpf_stored = cipher.encrypt(cpf.encode()).decode('utf-8')
        except Exception:
            cpf_stored = cpf

    usuario = {
        "id": None,
        "nome": nome,
        "email": email,
        "telefone": telefone,
        "cpf": cpf_stored,
        "data_nascimento": data_nascimento,
        "senha": senha_hash,
    }

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute(
            '''INSERT INTO usuarios (id, nome, email, telefone, cpf, data_nascimento, senha)
               VALUES (:id, :nome, :email, :telefone, :cpf, :data_nascimento, :senha)''',
            usuario,
        )
        conn.commit()
    except sqlite3.IntegrityError as e:
        conn.close()
        flash('Email já cadastrado ou dados inválidos.', 'danger')
        return redirect(url_for('homePage'))
    conn.close()

    return redirect(url_for("confirmacao", nome=usuario["nome"]))


@app.route("/confirmacao")
def confirmacao():
    nome = request.args.get("nome")
    return render_template("confirmacao.html", nome=nome)


def get_db():
    return sqlite3.connect(DATABASE_PATH)


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        senha = request.form.get("senha")

        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT id, nome, senha FROM usuarios WHERE email = ?", (email,))
        user = cursor.fetchone()
        db.close()

        if user and check_password_hash(user[2], senha):
            session["user_id"] = user[0]
            session["user_nome"] = user[1]
            flash("Login realizado com sucesso!", "success")
            return redirect(url_for("home"))
        else:
            flash("Email ou senha incorretos.", "danger")

    return render_template("login.html")


@app.route("/home")
def home():
    if "user_id" not in session:
        return redirect(url_for("login"))
    nome = session.get("user_nome")
    return render_template("home.html", nome=nome)


@app.route("/logout")
def logout():
    session.clear()
    flash("Você saiu da conta com sucesso!", "info")
    return redirect(url_for("login"))


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "True")