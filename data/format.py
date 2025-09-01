import re

# Caminho do arquivo de entrada e saída
caminho_entrada = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\frentes_filtrado.csv'
caminho_saida = r'c:\Users\lobas\Downloads\PF1-Web\data\csv\frentes_filtrado_corrigido.csv'

def corrigir_padroes(texto):
    """
    Aplica filtros para formatar o CSV:
    1. Substitui os `;` no meio do texto por espaços, exceto se for seguido de dois espaços.
    2. Remove o `;` após padrões como (BH129).
    3. Substitui o `;` por espaço em padrões como BH128; BH129; BH130.
    4. Remove todos os parênteses.
    5. Remove os caracteres `/`, `\` e `|`.
    6. Mantém o `;` final.
    """
    # Substitui os `;` dentro de parênteses por espaços
    texto = re.sub(r"\(([^()]+?)\)", lambda m: f"{m.group(1).replace(';', ' ')}", texto)
    
    # Remove o `;` após padrões como (BH129)
    texto = re.sub(r"\((BH\d+)\);", r"\1", texto)
    
    # Substitui o `;` por espaço em padrões como BH128; BH129; BH130
    texto = re.sub(r"(BH\d+);", r"\1 ", texto)
    
    # Remove todos os parênteses restantes
    texto = re.sub(r"[()]", "", texto)

    # Remove os caracteres `/`, `\`
    texto = re.sub(r"[\\/]", "", texto)
    
    
    texto = re.sub(r"disponível", "", texto)
    
    return texto

def processar_arquivo(caminho_entrada, caminho_saida):
    try:
        with open(caminho_entrada, mode='r', encoding='utf-8') as entrada, \
             open(caminho_saida, mode='w', encoding='utf-8') as saida:
            
            for linha in entrada:
                # Aplica a correção em cada linha
                linha_corrigida = corrigir_padroes(linha)
                saida.write(linha_corrigida)
        
        print(f"Arquivo processado e salvo em: {caminho_saida}")
    except Exception as e:
        print(f"Erro ao processar o arquivo: {e}")

# Executa a função para processar o arquivo
processar_arquivo(caminho_entrada, caminho_saida)