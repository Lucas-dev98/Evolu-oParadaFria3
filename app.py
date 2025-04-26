from flask import Flask, render_template, jsonify
import csv
import os
import sys

app = Flask(__name__)

IMAGE_MAPPING = {
    "Contratos": "/static/images/contratos.png",
    "Logística": "/static/images/logistica.png",
    "Ventilador": "/static/images/ventilador.png",
    "Espeçador": "/static/images/espessador.png",
    "Financeiro": "/static/images/financeiro.png",
    "Eletrica": "/static/images/eletrica.png",
    "Forno": "/static/images/forno.png",
    "Precipitador": "/static/images/precipitador.png",
}


# Função para carregar os dados do CSV
def load_frentes_from_csv(file_path):
    frentes = []
    try:
        print(f"Tentando carregar o arquivo: {file_path}")
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                print(f"Lendo linha: {row}")  # Log para depuração
                frentes.append({
                    "name": row["name"],
                    "value": int(row["value"]),
                    "image": IMAGE_MAPPING.get(row["name"], "/static/images/default.png")  # Adiciona a imagem
                })
    except FileNotFoundError:
        print(f"Erro: O arquivo {file_path} não foi encontrado.")
    except Exception as e:
        print(f"Erro ao carregar o arquivo CSV: {e}")
    return frentes
# Rota principal para renderizar o dashboard
@app.route("/")
def index():
    return render_template("index.html")

# Rota para fornecer os dados do CSV como JSON
@app.route("/api/frentes")
def get_frentes():
    frentes = load_frentes_from_csv("templates/frentes.csv")  # Corrigido o caminho
    return jsonify(frentes)

if __name__ == "__main__":
    app.run(debug=True)