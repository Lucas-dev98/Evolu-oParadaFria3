# 📋 Guia de Atualização de Arquivos CSV

## 🎯 Visão Geral

Este sistema carrega dados de cronogramas de dois arquivos CSV principais:

- **Cronograma de Preparação**: `cronograma-preparacao-real.csv`
- **Cronograma Operacional**: `cronograma-operacional.csv`

## 📁 Localização dos Arquivos

Os arquivos CSV devem estar na pasta:

```
/frontend/dashboard/public/
├── cronograma-preparacao-real.csv    ← Dados do PFUS3 (Preparação)
└── cronograma-operacional.csv        ← Dados da Parada (Operacional)
```

## 🔄 Métodos de Atualização

### Método 1: Interface Visual (Recomendado)

1. **Acesso**: Faça login como administrador
2. **Abrir Manager**: Clique no ícone 📄 no header ou menu do usuário → "Gerenciar CSV"
3. **Upload**: Selecione o tipo (Preparação/Operacional) e faça upload do novo arquivo
4. **Validação**: Sistema valida automaticamente a estrutura
5. **Backup**: Backup automático do arquivo anterior
6. **Aplicar**: Confirme o upload e recarregue a aplicação

### Método 2: Substituição Manual

1. **Backup**: Faça backup dos arquivos atuais
2. **Substituir**: Copie o novo arquivo para `/public/` com o nome correto
3. **Recarregar**: Atualize a página (F5) para ver as mudanças

## 📊 Estruturas dos Arquivos

### Cronograma de Preparação (`cronograma-preparacao-real.csv`)

```csv
ID,Task Name,% Complete,% Physical,Baseline Start,Duration,Start,Finish,Predecessors,Resource Names,Text1,Text2,Text3,Text4,Text5,Text6
1,Projeto PFUS3,0%,0%,,365 days,01/01/2025,31/12/2025,,,,,,,
2,  Logística,0%,0%,,90 days,01/01/2025,31/03/2025,,,,,,,
3,    Mobilização de Equipamentos,0%,0%,,30 days,01/01/2025,31/01/2025,,,,,,,
```

**Campos Obrigatórios:**

- `ID`: Identificador único da tarefa
- `Task Name`: Nome da atividade (hierarquia com espaços)
- `% Complete`: Percentual de conclusão
- `% Physical`: Percentual físico
- `Duration`: Duração (ex: "30 days")
- `Start`: Data de início
- `Finish`: Data de fim

### Cronograma Operacional (`cronograma-operacional.csv`)

```csv
Activity ID,Activity Name,Duration,Start Date,Finish Date,% Complete,Resource Names,Predecessors
OP001,Início da Parada,1 day,15/06/2025,15/06/2025,0%,,
OP002,Isolamento de Equipamentos,2 days,16/06/2025,17/06/2025,0%,Operação,OP001
```

**Campos Obrigatórios:**

- `Activity ID`: Identificador da atividade
- `Activity Name`: Nome da atividade
- `Duration`: Duração
- `Start Date`: Data de início
- `Finish Date`: Data de fim

## ✅ Validações Automáticas

O sistema valida:

- **Estrutura**: Headers obrigatórios presentes
- **Consistência**: Número de colunas por linha
- **Dados**: Campos não vazios nas linhas de dados
- **Formato**: Arquivo deve ser .csv válido

## 🔧 Processo Técnico

### 1. Carregamento dos Dados

```typescript
// No App.tsx - carregamento automático na inicialização
const response = await fetch('/cronograma-preparacao-real.csv');
const csvText = await response.text();
```

### 2. Processamento

- **Parser CSV**: Separa linhas e colunas
- **Hierarquia**: Detecta níveis por espaços no nome
- **Categorização**: Organiza por grupos (Logística, Refratário, etc.)
- **Validação**: Verifica integridade dos dados

### 3. Distribuição

- **Analytics → KPIs**: Métricas e resumos
- **Analytics → Gantt**: Timeline visual
- **Analytics → CPM**: Análise de caminho crítico
- **Analytics → Fases**: Próximas atividades

## 🚨 Troubleshooting

### Problema: "Arquivo não encontrado"

- **Causa**: Arquivo não está em `/public/`
- **Solução**: Verificar nome e localização exatos

### Problema: "Erro de parsing"

- **Causa**: Formato CSV inválido
- **Solução**: Verificar separadores de vírgula, encoding UTF-8

### Problema: "Dados não aparecem"

- **Causa**: Cache do navegador
- **Solução**: Hard refresh (Ctrl+F5) ou limpar cache

### Problema: "Validação falhou"

- **Causa**: Headers ou estrutura incorreta
- **Solução**: Comparar com template fornecido

## 📈 Impacto da Atualização

### Cronograma de Preparação

- **Afeta**: Analytics completo (KPIs, Gantt, CPM, Fases)
- **Recalcula**: Métricas de progresso, caminhos críticos
- **Atualiza**: Lista de próximas atividades

### Cronograma Operacional

- **Afeta**: Modo Detalhado
- **Recalcula**: Resumo de atividades operacionais
- **Atualiza**: Timeline de parada

## 🔄 Automatização Futura

### Possíveis Melhorias:

1. **API de Upload**: Endpoint para receber arquivos
2. **Validação Server-side**: Validação no backend
3. **Versionamento**: Histórico de versões dos arquivos
4. **Sincronização**: Atualização automática de fontes externas
5. **Notificações**: Alertas de atualização disponível

## 📞 Suporte

Para problemas técnicos:

1. Verificar console do navegador (F12)
2. Testar com arquivo template
3. Validar formato e encoding
4. Contactar equipe de desenvolvimento

---

_Última atualização: ${new Date().toLocaleDateString('pt-BR')}_
