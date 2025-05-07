from flask import Flask, render_template, jsonify
import csv
import os
import sys

app = Flask(__name__)

IMAGE_MAPPING = {
    "Patio de Alimentação": "/static/images/frentes/patioAlimentação.png",
    "Secagem": "/static/images/frentes/secagem.png",
    "Torre de Resfriamento": "/static/images/frentes/TorreResfriamento.png",
    "Mistura": "/static/images/frentes/mistura.png",
    "Briquetagem": "/static/images/frentes/briquetagem.png",
    "Forno": "/static/images/frentes/forno.png",
    "Ventiladores": "static/images/frentes/ventilador.png",  # Corrigido
    "Precipitadores": "/static/images/frentes/precipitador.png",  # Corrigido
    "Peneiramento": "/static/images/frentes/peneiramento.png",
    "Patio de Briquete": "/static/images/frentes/patioBriquete.png",
    "Curva S" : "/static/images/curva/20240730 - Curva da PF4 2024.png",
}

def load_frentes_from_csv(file_path):
    """
    Carrega os dados das frentes de trabalho a partir de um arquivo CSV.

    Args:
        file_path (str): Caminho para o arquivo CSV.

    Returns:
        list: Lista de dicionários contendo os dados das frentes de trabalho.
    """
    frentes = []  # Lista para armazenar as frentes de trabalho
    try:
        print(f"Tentando carregar o arquivo: {file_path}")  # Log para depuração
        with open(file_path, mode='r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)  # Lê o arquivo CSV como um dicionário
            for row in reader:
                print(f"Lendo linha: {row}")  # Log para depuração de cada linha do CSV
                sub_activities = []  # Lista para armazenar as atividades secundárias

                # Verifica se há atividades secundárias na linha
                if "sub_activities" in row and row["sub_activities"]:
                    sub_activities_raw = row["sub_activities"].split(";")  # Divide as atividades por ";"
                    for sub_activity in sub_activities_raw:
                        name, value = sub_activity.split(":")  # Divide o nome e o valor por ":"
                        sub_activities.append({
                            "name": name.strip(),  # Remove espaços extras do nome
                            "value": min(int(value.strip()), 100)  # Garante que o valor não ultrapasse 100
                        })

                # Calcula o valor real (value) com base nas atividades secundárias ou no campo "value"
                if sub_activities:
                    # Calcula a média dos valores das atividades secundárias
                    value = sum(sub["value"] for sub in sub_activities) / len(sub_activities)
                    value = min(value, 100)  # Garante que o valor não ultrapasse 100
                else:
                    # Usa o valor diretamente do campo "value" no CSV
                    value = min(int(row["value"]), 100)

                # Adiciona os dados da frente de trabalho à lista
                frentes.append({
                    "name": row["name"],  # Nome da frente de trabalho
                    "value": value,  # Valor real (progresso)
                    "baseline": int(row["baseline"]),  # Valor planejado
                    "image": IMAGE_MAPPING.get(row["name"], "/static/images/frentes/default.png"),  # Caminho da imagem
                    "sub_activities": sub_activities  # Lista de atividades secundárias
                })
        print(f"Frentes carregadas: {frentes}")  # Log para depuração após carregar todas as frentes
    except FileNotFoundError:
        # Tratamento de erro caso o arquivo não seja encontrado
        print(f"Erro: O arquivo {file_path} não foi encontrado.")
    except Exception as e:
        # Tratamento de erro genérico
        print(f"Erro ao carregar o arquivo CSV: {e}")
    return frentes  # Retorna a lista de frentes de trabalho

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