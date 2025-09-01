import csv
import chardet

# Função para processar o CSV e organizar as atividades e subatividades
def processar_frentes(caminho_arquivo):
    # Detecta a codificação do arquivo
    with open(caminho_arquivo, 'rb') as file:
        result = chardet.detect(file.read())
        encoding_detected = result['encoding']
        print(f"Codificação detectada: {encoding_detected}")

    # Abre o arquivo com a codificação detectada
    with open(caminho_arquivo, 'r', encoding=encoding_detected, errors='replace') as file:
        reader = csv.DictReader(file, delimiter=';')  # Usa DictReader para lidar com cabeçalhos
        linhas = list(reader)  # Lê todas as linhas do CSV

    # Estrutura para armazenar o resultado
    atividades = []

    # Variável para armazenar a atividade atual de nível 3
    atividade_atual = None

    for linha in linhas:
        nome = linha['Nome']
        nivel = linha.get('Nível_da_estrutura_de_tópicos', '')
        dashboard = linha.get('Dashboard', '')  # CORREÇÃO: Adicionar leitura do campo Dashboard

        if nivel == '3':  # Atividade principal
            # Salva a atividade anterior apenas se tiver subatividades
            if atividade_atual and atividade_atual['sub_activities']:
                atividades.append(atividade_atual)
            # Inicializa uma nova atividade
            atividade_atual = {
                'name': nome,
                'value': linha['Porcentagem_Prev_Real'],    # REAL
                'baseline': linha['Porcentagem_Prev_LB'],   # PLANEJADO
                'sub_activities': []  # Inicializa a lista de subatividades
            }
        elif nivel == '4' and atividade_atual and dashboard == 'S':  # Subatividade com Dashboard S
            # CORREÇÃO: Ordem correta Real|Planejado
            subatividade = f"{nome}:{linha['Porcentagem_Prev_Real']}|{linha['Porcentagem_Prev_LB']}"
            atividade_atual['sub_activities'].append(subatividade)

    # Adiciona a última atividade ao resultado, se tiver subatividades
    if atividade_atual and atividade_atual['sub_activities']:
        atividades.append(atividade_atual)

    return atividades

# Caminho do arquivo CSV de entrada
caminho_arquivo_entrada = r'c:\Users\lobas\Downloads\PF1-Web\data\Project\250619 - Report - PFBT1.csv'

# Caminho do arquivo CSV de saída
caminho_arquivo_saida = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\frentes_filtrado.csv'

# Processa o CSV
resultado = processar_frentes(caminho_arquivo_entrada)

# Salva o resultado no arquivo de saída
with open(caminho_arquivo_saida, 'w', encoding='utf-8', newline='') as file:
    # Define os cabeçalhos do CSV
    fieldnames = ['name', 'value', 'baseline', 'sub_activities']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()  # Escreve o cabeçalho

    # Escreve as atividades e subatividades no CSV
    for atividade in resultado:
        # Converte a lista de subatividades em uma string para salvar no CSV
        atividade['sub_activities'] = '; '.join(atividade['sub_activities'])
        writer.writerow(atividade)

print(f"Arquivo processado com sucesso: {caminho_arquivo_saida}")