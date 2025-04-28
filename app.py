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
        "Meio do Forno": "/static/images/precipitador.png",
        "Forno ( Abaixamento)": "/static/images/precipitador.png",
        "Forno ( Levantamento)": "/static/images/forno.png",
}

# Atualizar a função para incluir atividades secundárias
def load_frentes_from_csv(file_path):
    frentes = []
    try:
        print(f"Tentando carregar o arquivo: {file_path}")
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                sub_activities = []
                if "sub_activities" in row and row["sub_activities"]:
                    sub_activities_raw = row["sub_activities"].split(";")
                    for sub_activity in sub_activities_raw:
                        name, value = sub_activity.split(":")
                        sub_activities.append({"name": name.strip(), "value": int(value.strip())})

                # Calcula a porcentagem da atividade pai com base nas subatividades
                if sub_activities:
                    total_value = sum(sub["value"] for sub in sub_activities)
                    total_value = min(total_value, 100)  # Limita o valor total a 100%
                else:
                    total_value = int(row["value"])  # Usa o valor da atividade pai se não houver subatividades

                frentes.append({
                    "name": row["name"],
                    "value": total_value,
                    "image": IMAGE_MAPPING.get(row["name"], "/static/images/default.png"),
                    "sub_activities": sub_activities
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

# 🎯 Dica Bônus adicionada aqui
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Pega a porta do ambiente (Render exige isso!)
    app.run(host="0.0.0.0", port=port, debug=True)
    # Para rodar localmente, use: python app.py
    # Para rodar no Render, use: render -p 5000 app.py