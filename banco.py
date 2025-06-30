import os
import json
from flask import Flask, jsonify, render_template, send_from_directory
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(
    __name__,
    template_folder="templates",
    static_folder="static",
)
CORS(app)

# Carrega o JSON das credenciais a partir da variável de ambiente
_creds_json = os.getenv("GCP_CREDENTIALS_JSON")
if not _creds_json:
    raise RuntimeError("A variável GCP_CREDENTIALS_JSON não está definida")

# Converte o JSON em dict
_creds_info = json.loads(_creds_json)

# Escopos necessários
SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/drive"
]

# Função utilitária para criar o client gspread
def get_client():
    creds = ServiceAccountCredentials.from_json_keyfile_dict(
        _creds_info,
        SCOPES
    )
    return gspread.authorize(creds)

SPREADSHEET_ID = "1VxVzBwtjbgCMJ8BDDlLdi3lgrflhZ4QNrFh6s5fa7L0"

@app.route("/materiais")
def get_materiais():
    try:
        client = get_client()
        sheet = client.open_by_key(SPREADSHEET_ID).worksheet("Materiais")
        valores = sheet.get_all_values()

        cabecalho = valores[0]
        linhas = valores[1:]

        resultado = []
        for linha in linhas:
            item = { cabecalho[i]: (linha[i] if i < len(linha) else "") 
                     for i in range(len(cabecalho)) }
            resultado.append(item)

        return jsonify(resultado)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/configuracoes")
def get_configuracoes():
    try:
        client = get_client()
        aba = client.open_by_key(SPREADSHEET_ID).worksheet("Dados")
        dados = aba.get_all_values()
        cabecalho, valores = dados[0], dados[1]

        configuracoes = {
            cabecalho[i].strip(): (valores[i].strip() if i < len(valores) else "")
            for i in range(len(cabecalho))
        }

        return jsonify(configuracoes)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/dobras")
def get_dobras():
    try:
        client = get_client()
        aba = client.open_by_key(SPREADSHEET_ID).worksheet("Dobra")
        valores = aba.get_all_values()

        cabecalho, linhas = valores[0], valores[1:]
        resultado = [
            { cabecalho[i]: (linha[i] if i < len(linha) else "") 
              for i in range(len(cabecalho)) }
            for linha in linhas
        ]

        return jsonify(resultado)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


# (Opcional) rota para servir estáticos manualmente, mas o Flask já faz isso via static_folder
@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)


@app.route("/")
def index():
    return render_template("form.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
