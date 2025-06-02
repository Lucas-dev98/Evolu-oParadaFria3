from flask import Flask, render_template, jsonify
import csv
import re, os

app = Flask(__name__)

IMAGE_MAPPING = {
    "Pátio de Alimentação": "static/images/frentes/patioAlimentação.png",
    "Secagem": "static/images/frentes/secagem.png",
    "Torre de Resfriamento": "static/images/frentes/TorreResfriamento.png",
    "Mistura": "static/images/frentes/mistura.png",
    "Briquetagem": "static/images/frentes/briquetagem.png",
    "Forno": "static/images/frentes/forno.png",
    "Ventiladores": "static/images/frentes/ventilador.png",
    "Precipitadores": "static/images/frentes/precipitador.png",
    "Peneiramento": "static/images/frentes/peneiramento.png",
    "Pátio de Briquete": "static/images/frentes/patioBriquete.png",
    "Retorno da Mistura": "static/images/frentes/retornoMistura.png",
}

def load_frentes_from_csv(file_path):
    frentes = []
    try:
        with open(file_path, mode="r", encoding="utf-8") as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                sub_activities = []
                if "sub_activities" in row and row["sub_activities"]:
                    sub_activities_raw = row["sub_activities"].split(";")
                    for sub_activity in sub_activities_raw:
                        try:
                            # Expressão regular CORRIGIDA para capturar números decimais com vírgula
                            match = re.match(r"(.+):\s*([0-9,\.]+)\|([0-9,\.]+)", sub_activity.strip())
                            if match:
                                name = match.group(1).strip()
                                real = min(100, (float(match.group(2).replace(',', '.'))))
                                planned = min(100, (float(match.group(3).replace(',', '.'))))
                                sub_activities.append({
                                    "name": name,
                                    "real": real,
                                    "planned": planned
                                })
                            else:
                                print(f"Subatividade mal formatada: {sub_activity}")
                        except Exception as e:
                            print(f"Erro ao processar subatividade: {sub_activity} - {e}")
                
                frentes.append({
                    "name": row["name"],
                    "planned": min(100, (float(row["baseline"].replace(',', '.')))),
                    "real": min(100, (float(row["value"].replace(',', '.')))),
                    "image": IMAGE_MAPPING.get(row["name"], "/static/images/frentes/default-placeholder.png"),
                    "sub_activities": sub_activities
                })
    except FileNotFoundError:
        print(f"Erro: Arquivo {file_path} não encontrado.")
    except Exception as e:
        print(f"Erro ao carregar o arquivo CSV: {e}")
    return frentes

@app.route("/")
def index():
    curva_dir = os.path.join('static', 'images', 'curva')
    # Lista todos os arquivos da pasta curva
    imagens = [f for f in os.listdir(curva_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
    # Ordena por data de modificação (mais recente por último)
    imagens.sort(key=lambda x: os.path.getmtime(os.path.join(curva_dir, x)))
    # Pega a última imagem (mais recente)
    imagem_curva = imagens[-1] if imagens else None
    return render_template('index.html', imagem_curva=imagem_curva)

@app.route("/api/procedimento_parada")
def get_procedimento_parada():
    frentes = load_frentes_from_csv(r"./data/csv/procedimento_parada.csv")
    return jsonify(frentes)

@app.route("/api/manutencao")
def get_manutencao():
    frentes = load_frentes_from_csv(r"./data/csv/manutencao.csv")
    return jsonify(frentes)

@app.route("/api/procedimento_partida")
def get_procedimento_partida():
    frentes = load_frentes_from_csv(r"./data/csv/procedimento_partida.csv")
    return jsonify(frentes)

if __name__ == "__main__":
    app.run(debug=True)