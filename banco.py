from flask import Flask, jsonify
from flask_cors import CORS
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask import send_from_directory
app = Flask(__name__)
CORS(app)

SERVICE_ACCOUNT_FILE = 'credentials.json'
SPREADSHEET_ID = '1VxVzBwtjbgCMJ8BDDlLdi3lgrflhZ4QNrFh6s5fa7L0'
SCOPES = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

@app.route("/materiais")
def get_materiais():
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, SCOPES)
        client = gspread.authorize(creds)

        sheet = client.open_by_key(SPREADSHEET_ID).worksheet("Materiais")
        valores = sheet.get_all_values()

        cabecalho = valores[0]
        linhas = valores[1:]

        resultado = []
        for linha in linhas:
            item = {}
            for i in range(len(cabecalho)):
                valor = linha[i] if i < len(linha) else ""
                item[cabecalho[i]] = valor
            resultado.append(item)

        return jsonify(resultado)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/configuracoes")
def get_configuracoes():
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, SCOPES)
        client = gspread.authorize(creds)

        aba_dados = client.open_by_key(SPREADSHEET_ID).worksheet("Dados")
        dados_raw = aba_dados.get_all_values()

        cabecalho = dados_raw[0]
        valores = dados_raw[1]

        configuracoes = {}
        for i in range(len(cabecalho)):
            chave = cabecalho[i].strip()
            valor = valores[i].strip() if i < len(valores) else ""
            configuracoes[chave] = valor

        return jsonify(configuracoes)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route("/dobras")
def get_dobras():
    try:
        creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, SCOPES)
        client = gspread.authorize(creds)

        aba_dobras = client.open_by_key(SPREADSHEET_ID).worksheet("Dobra")
        linhas = aba_dobras.get_all_values()

        cabecalho = linhas[0]
        dados = linhas[1:]

        resultado = []
        for linha in dados:
            item = {}
            for i in range(len(cabecalho)):
                valor = linha[i] if i < len(linha) else ""
                item[cabecalho[i]] = valor
            resultado.append(item)

        return jsonify(resultado)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# ⚠️ Esse bloco DEVE vir por último
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
