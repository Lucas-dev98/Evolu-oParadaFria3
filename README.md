# Dashboard Interativo de Evento

Dashboard web responsivo para monitoramento em tempo real de áreas de eventos, desenvolvido com React, TypeScript e Node.js.

## 🚀 Características

### Frontend

- **React + TypeScript**: Interface moderna e type-safe
- **Design Responsivo**: Adaptável a todos os dispositivos (mobile, tablet, desktop)
- **Gráficos Interativos**: Utilizando Chart.js para visualização de dados
- **Tempo Real**: Atualização automática a cada 30 segundos
- **Interface Intuitiva**: Cards informativos, modais de detalhes e indicadores visuais

### Backend

- **Node.js + Express**: API RESTful robusta
- **TypeScript**: Código mais seguro e mantível
- **CORS**: Configurado para comunicação frontend-backend
- **Dados Simulados**: Sistema completo de simulação para demonstração

## 📊 Funcionalidades do Dashboard

### Visão Geral

- **Cards de Resumo**: Estatísticas gerais do evento
  - Total de pessoas no evento
  - Áreas ativas
  - Taxa de ocupação geral
  - Temperatura média

### Visualizações

- **Gráfico de Evolução**: Mostra a evolução temporal da ocupação de todas as áreas
- **Gráfico de Distribuição**: Visualiza a distribuição de pessoas por categoria de área
- **Cards de Áreas**: Informações detalhadas de cada área com:
  - Status em tempo real
  - Taxa de ocupação com indicadores visuais
  - Temperatura e umidade
  - Ícones representativos por categoria

### Detalhes das Áreas

- **Modal Interativo**: Clique em qualquer área para ver:
  - Gráfico de evolução específica da área
  - Métricas detalhadas
  - Histórico de ocupação
  - Condições ambientais

### Áreas Monitoradas

1. **Palco Principal** (Entretenimento)
2. **Área de Alimentação** (Serviços)
3. **Stand de Exposições** (Comercial)
4. **Área VIP** (Premium)
5. **Estacionamento** (Infraestrutura)
6. **Área de Descanso** (Bem-estar)

## 🛠️ Tecnologias Utilizadas

### Frontend

- React 18
- TypeScript
- Chart.js + react-chartjs-2
- Lucide React (ícones)
- Axios (requisições HTTP)
- CSS3 com design responsivo

### Backend

- Node.js
- Express.js
- TypeScript
- CORS
- Nodemon (desenvolvimento)

## 📱 Responsividade

O dashboard foi projetado para funcionar perfeitamente em:

- **Desktop**: Layout completo com todos os componentes visíveis
- **Tablet**: Layout adaptado com reorganização de elementos
- **Mobile**: Layout otimizado para tela pequena com navegação touch-friendly

### Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend/dashboard
npm install
npm start
```

O dashboard estará disponível em `http://localhost:3000`

## 📡 API Endpoints

### GET /api/areas

Retorna todas as áreas do evento com suas informações completas.

### GET /api/areas/:id

Retorna informações específicas de uma área.

### GET /api/summary

Retorna estatísticas gerais do evento.

### GET /api/realtime

Retorna dados em tempo real de todas as áreas.

### GET /api/evolution

Retorna dados de evolução temporal para gráficos.

## 🎨 Design e UX

### Cores e Indicadores

- **Verde**: Ocupação baixa (< 50%)
- **Amarelo**: Ocupação moderada (50-80%)
- **Vermelho**: Ocupação alta (> 80%)

### Ícones por Categoria

- 🎭 Entretenimento
- 🍽️ Serviços
- 🏪 Comercial
- ⭐ Premium
- 🚗 Infraestrutura
- 🛋️ Bem-estar

### Animações

- Transições suaves entre estados
- Loading spinners durante carregamento
- Hover effects nos cards
- Animações de entrada de dados

## 🔄 Funcionalidades em Tempo Real

- **Atualização Automática**: Dados atualizados a cada 30 segundos
- **Indicador de Conectividade**: Mostra status online/offline
- **Timestamp**: Exibe horário da última atualização
- **Dados Simulados**: Sistema simula variações realistas nos dados

## 📈 Métricas Monitoradas

Para cada área:

- **Ocupação Atual**: Número de pessoas presentes
- **Capacidade Máxima**: Limite da área
- **Taxa de Ocupação**: Percentual de ocupação
- **Temperatura**: Condições ambientais
- **Umidade**: Percentual de umidade relativa
- **Status**: Ativo/Inativo
- **Histórico**: Evolução ao longo do tempo

## 🔧 Configuração

### Personalização

- Modifique `backend/src/index.ts` para alterar dados das áreas
- Ajuste cores no arquivo `frontend/dashboard/src/App.css`
- Configure intervalos de atualização no componente principal

### Deploy

O projeto está preparado para deploy em:

- **Frontend**: Netlify, Vercel, GitHub Pages
- **Backend**: Heroku, Railway, Digital Ocean

## 📞 Suporte

Para dúvidas ou sugestões sobre o dashboard, consulte a documentação do código ou abra uma issue no repositório.

---

**Dashboard Interativo de Evento** - Solução completa para monitoramento de eventos em tempo real.
