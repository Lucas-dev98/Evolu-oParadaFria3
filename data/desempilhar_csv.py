import csv

# Caminhos dos arquivos
caminho_entrada = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\frentes_filtrado_corrigido.csv'
caminho_saida1 = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\procedimento_parada.csv'
caminho_saida2 = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\manutencao.csv'
caminho_saida3 = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\procedimento_partida.csv'

# Função para carregar todas as linhas em uma pilha
def carregar_em_pilha(caminho_entrada):
    try:
        pilha = []
        with open(caminho_entrada, mode='r', encoding='utf-8') as arquivo_entrada:
            reader = csv.DictReader(arquivo_entrada)
            for row in reader:
                pilha.append(row)
        print("Todas as linhas foram carregadas na pilha com sucesso.")
        return pilha
    except FileNotFoundError:
        print(f"Erro: Arquivo de entrada {caminho_entrada} não encontrado.")
    except Exception as e:
        print(f"Erro ao processar o arquivo: {e}")
        return None

# Função para salvar cada bloco em arquivos separados usando pilhas auxiliares
def salvar_blocos_em_arquivos(pilha, saidas):
    try:
        if not pilha:
            print("A pilha está vazia. Nada será salvo.")
            return

        fieldnames = pilha[0].keys()

        # Três pilhas auxiliares, uma para cada bloco
        pilha_aux_parada = []
        pilha_aux_manutencao = []
        pilha_aux_partida = []

        cont = 0

        while pilha and cont < 3:
            linha = pilha.pop()

            if cont == 0:
                pilha_aux_parada.append(linha)
            elif cont == 1:
                pilha_aux_manutencao.append(linha)
            elif cont == 2:
                pilha_aux_partida.append(linha)

            if linha['name'].strip() == "Pátio de Alimentação":
                cont += 1

        # Função auxiliar para salvar cada pilha
        def salvar_pilha_em_arquivo(pilha_aux, caminho_saida, nome_bloco):
            with open(caminho_saida, mode='w', encoding='utf-8', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                while pilha_aux:
                    writer.writerow(pilha_aux.pop())  # Reverte ordem ao escrever
            print(f"{nome_bloco} salvo em: {caminho_saida}")

        # Salvar os dados usando as pilhas auxiliares
        salvar_pilha_em_arquivo(pilha_aux_parada, caminho_saida3, "Procedimento de Parada")
        salvar_pilha_em_arquivo(pilha_aux_manutencao, caminho_saida2, "Manutenção")
        salvar_pilha_em_arquivo(pilha_aux_partida, caminho_saida1, "Procedimento de Partida")

    except Exception as e:
        print(f"Erro ao salvar os blocos: {e}")

# Executa a função para carregar as linhas em uma pilha
pilha_de_linhas = carregar_em_pilha(caminho_entrada)

# Se a pilha foi carregada, salva os três blocos nos arquivos correspondentes
if pilha_de_linhas:
    print(f"Número total de linhas na pilha: {len(pilha_de_linhas)}")
    print("Topo da pilha:", pilha_de_linhas[-1])
    salvar_blocos_em_arquivos(pilha_de_linhas, [caminho_saida1, caminho_saida2, caminho_saida3])
