# Sistema de Upload por Fases - EPU

## 📋 Visão Geral

O sistema agora suporta **upload diferenciado por fase**, permitindo carregar dados específicos para cada etapa da parada de usina:

- **Preparação** - Atividades de preparação da parada
- **Parada** - Processo de desligamento da usina
- **Manutenção** - Atividades de manutenção e reparo
- **Partida** - Processo de religamento da usina

## 🚀 Como Usar

### 1. Acesso ao Sistema de Upload

1. Faça login como **administrador**
2. Clique no botão **"Carregar Dados"** no menu superior
3. Selecione **"Upload por Fases"** no seletor de modo

### 2. Upload por Fase

1. **Selecione a fase** desejada clicando no card correspondente
2. **Arraste e solte** ou **clique para selecionar** o arquivo CSV/Excel
3. O sistema **validará automaticamente** o formato
4. Os dados serão **salvos localmente** e integrados ao dashboard

### 3. Formato dos Arquivos

#### 📁 Preparação

```csv
ID,Atividade,Área,Responsável,Data Início,Data Fim,Status,Categoria,Criticidade,Observações
PREP-001,Isolamento Elétrico,Subestação,João,2025-01-15,2025-01-16,concluida,Elétrica,alta,Concluído
```

#### 🔴 Parada

```csv
ID,Atividade,Área,Responsável,Data Início,Data Fim,Status,Categoria,Criticidade,Risco
PAR-001,Desligamento Total,Controle,Supervisor,2025-01-25,2025-01-25,concluida,Operacional,crítica,Alto
```

#### 🔧 Manutenção

```csv
ID,Atividade,Equipamento,Responsável,Data Início,Data Fim,Status,Tipo Manutenção,Prioridade,Recursos
MAN-001,Inspeção Tubos,Caldeira 1,Inspetor,2025-01-29,2025-02-02,em_andamento,Preventiva,alta,5 pessoas
```

#### ✅ Partida

```csv
ID,Atividade,Sistema,Responsável,Data Início,Data Fim,Status,Teste,Resultado,Aprovação
PART-001,Pressurização,Sistema Vapor,Operador,2025-02-08,2025-02-09,pendente,Pressão,Pendente,Não
```

## 🎯 Funcionalidades

### ✨ Upload Inteligente

- **Validação automática** das colunas obrigatórias
- **Detecção de formato** (CSV/Excel)
- **Feedback visual** do status do upload
- **Templates downloadáveis** para cada fase

### 📊 Integração com Dashboard

- Os dados carregados **atualizam automaticamente** as métricas das fases
- **Cálculo dinâmico** do progresso baseado no status das atividades
- **Visualização executiva** específica por fase

### 🔄 Gerenciamento de Dados

- **Armazenamento local** persistente
- **Limpeza seletiva** por fase
- **Resumo visual** dos dados carregados
- **Contadores de atividades** por status

## 📈 Métricas Calculadas

O sistema calcula automaticamente:

- **Progresso da fase** (% de atividades concluídas)
- **Atividades atrasadas** (status = 'atrasada')
- **Atividades críticas** (criticidade = 'alta')
- **Total de atividades** por fase

## 🎨 Interface

### Cards de Seleção

- **Cores específicas** por fase (Azul, Vermelho, Laranja, Verde)
- **Ícones identificadores** para cada tipo
- **Contador de atividades** carregadas
- **Indicador visual** de dados carregados

### Área de Upload

- **Drag & drop** funcional
- **Feedback visual** durante upload
- **Mensagens de status** detalhadas
- **Lista de colunas esperadas**

## 📝 Exemplos Práticos

### Arquivos de Exemplo

O sistema inclui arquivos de exemplo para cada fase:

- `exemplo_preparacao.csv`
- `exemplo_parada.csv`
- `exemplo_manutencao.csv`
- `exemplo_partida.csv`

### Status Possíveis

- **concluida** - Atividade finalizada
- **em_andamento** - Em execução
- **pendente** - Aguardando início
- **atrasada** - Com atraso
- **critica** - Situação crítica

## 🔧 Tecnologias

- **React + TypeScript** - Interface moderna e tipada
- **Papa Parse** - Processamento CSV robusto
- **XLSX** - Suporte a arquivos Excel
- **React Dropzone** - Upload por drag & drop
- **Lucide React** - Ícones consistentes
- **Tailwind CSS** - Styling responsivo

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique se o arquivo está no formato correto
2. Confirme se as colunas obrigatórias estão presentes
3. Use os templates fornecidos como referência
4. Consulte as mensagens de erro para orientação específica
