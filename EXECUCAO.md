# Scripts de Execução

Este documento contém os comandos para executar o dashboard.

## Backend (Porta 3001)

```bash
cd backend
npm install
npm run build
npm start
```

## Frontend (Porta 60453)

```bash
cd frontend/dashboard
npm install
npm run build
npx serve -s build -p 3000
```

## Execução Rápida

### Backend

```bash
cd C:\Users\lobas\Downloads\PF3-WEB\backend
tsc && node dist/index.js
```

### Frontend

```bash
cd C:\Users\lobas\Downloads\PF3-WEB\frontend\dashboard
npm run build
npx serve -s build -p 3000
```

## URLs

- **Frontend**: http://localhost:60453
- **Backend API**: http://localhost:3001/api
- **API de Resumo**: http://localhost:3001/api/summary
- **API de Áreas**: http://localhost:3001/api/areas

## Status Atual

✅ Backend funcionando na porta 3001
✅ Frontend funcionando na porta 3000 (desenvolvimento com Tailwind CSS)
✅ Sistema de upload de arquivos CSV/Excel implementado

## Funcionalidades Implementadas

### Upload de Dados

- ✅ Upload de arquivos CSV e Excel
- ✅ Processamento automático dos dados
- ✅ Persistência em arquivo JSON
- ✅ Template de exemplo disponível
- ✅ Preview dos dados antes do envio

### Dashboard Completo

- ✅ Interface responsiva para todos os dispositivos
- ✅ Gráficos interativos funcionando
- ✅ Comunicação com backend estabelecida
- ✅ Atualização em tempo real ativa
- ✅ Modal de detalhes das áreas
- ✅ Cards informativos com métricas
- ✅ Botão de carregar dados via arquivo

## Nota Importante

O dashboard está configurado com Tailwind CSS e todas as funcionalidades estão completamente operacionais.
Agora você pode carregar dados personalizados através de arquivos CSV ou Excel!
