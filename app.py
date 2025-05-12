from flask import Flask, render_template, jsonify
import csv
import os
import csv

app = Flask(__name__)


IMAGE_MAPPING = {
    "Patio_Alimentação": "/static/images/frentes/patioAlimentacao.png",
    "Secagem": "/static/images/frentes/secagem.png",
    "Torre_Resfriamento": "/static/images/frentes/TorreResfriamento.png",
    "Mistura": "/static/images/frentes/mistura.png",
    "Briquetagem": "/static/images/frentes/briquetagem.png",
    "Forno": "/static/images/frentes/forno.png",
    "Ventiladores": "static/images/frentes/ventilador.png",  # Corrigido
    "Precipitadores": "/static/images/frentes/precipitador.png",  # Corrigido
    "Peneiramento": "/static/images/frentes/peneiramento.png",
    "Patio_Briquete": "/static/images/frentes/patioBriquete.png",
    "Curva S" : "/static/images/curva/20240730 - Curva da PF4 2024.png",
}
# Removed misplaced code

def load_frentes_from_csv(file_path):
    frentes = []
    try:
        with open(file_path, mode="r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                # Extrai o nome e mapeia a imagem
                name = row.get("name", "").strip()
                image = IMAGE_MAPPING.get(name, "/static/images/default.png")
                
                sub_activities = []
                if "sub_activities" in row and row["sub_activities"]:
                    sub_activities_raw = row["sub_activities"].split(";")
                    for sub_activity in sub_activities_raw:
                        try:
                            # Verifica se o formato está correto
                            if ":" in sub_activity and "|" in sub_activity:
                                sub_name, values = sub_activity.split(":")
                                real, planned = map(int, values.split("|"))
                                sub_activities.append({
                                    "name": sub_name.strip(),
                                    "real": real,
                                    "planned": planned
                                })
                            else:
                                print(f"Formato inválido para subatividade: {sub_activity}")
                        except ValueError:
                            print(f"Erro ao processar subatividade: {sub_activity}")
            
                frentes.append({
                    "name": name,
                    "real": int(row.get("value", 0)),
                    "planned": int(row.get("baseline", 0)),
                    "image": image,
                    "sub_activities": sub_activities
                })
    except FileNotFoundError:
        print(f"Erro: Arquivo {file_path} não encontrado.")
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
    frentes = load_frentes_from_csv(r"./data/csv/frentes_filtrado.csv")
    return jsonify(frentes)

# 🎯 Dica Bônus adicionada aqui
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Pega a porta do ambiente (Render exige isso!)
    app.run(host="0.0.0.0", port=port, debug=True)
    # Para rodar localmente, use: python app.py
    # Para rodar no Render, use: render -p 5000 app.py