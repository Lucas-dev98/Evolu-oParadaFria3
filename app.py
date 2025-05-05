from flask import Flask, render_template, jsonify
import csv
import os
import sys

app = Flask(__name__)

IMAGE_MAPPING = {
    "Patio de Alimentação": "/static/images/patioAlimentação.png",
    "Secagem": "/static/images/secagem.png",
    "Torre de Resfriamento": "/static/images/TorreResfriamento.png",
    "Mistura": "/static/images/mistura.png",
    "Briquetagem": "/static/images/briquetagem.png",
    "Forno": "/static/images/forno.png",
    "Ventiladores": "static/images/ventilador.png",  # Corrigido
    "Precipitadores": "/static/images/precipitador.png",  # Corrigido
    "Peneiramento": "/static/images/peneiramento.png",
    "Patio de Briquete": "/static/images/patioBriquete.png",
}

def load_frentes_from_csv(file_path):
    frentes = []
    try:
        print(f"Tentando carregar o arquivo: {file_path}")
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                print(f"Lendo linha: {row}")  # Adicionado para depuração
                sub_activities = []
                if "sub_activities" in row and row["sub_activities"]:
                    sub_activities_raw = row["sub_activities"].split(";")
                    for sub_activity in sub_activities_raw:
                        name, value = sub_activity.split(":")
                        sub_activities.append({"name": name.strip(), "value": min(int(value.strip()), 100)})

                if sub_activities:
                    value = sum(sub["value"] for sub in sub_activities) / len(sub_activities)
                    value = min(value, 100)
                else:
                    value = min(int(row["value"]), 100)

                frentes.append({
                    "name": row["name"],
                    "value": value,
                    "baseline": int(row["baseline"]),
                    "image": IMAGE_MAPPING.get(row["name"], "/static/images/default.png"),
                    "sub_activities": sub_activities
                })
        print(f"Frentes carregadas: {frentes}")  # Adicionado para depuração
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

# 🎯 Dica Bônus adicionada aqui
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Pega a porta do ambiente (Render exige isso!)
    app.run(host="0.0.0.0", port=port, debug=True)
    # Para rodar localmente, use: python app.py
    # Para rodar no Render, use: render -p 5000 app.py