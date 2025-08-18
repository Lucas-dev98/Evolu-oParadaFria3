# 🚀 Guia de Deploy no Render.com

## ✅ Configurações no Render Dashboard

### 1. **Build & Deploy Settings**

No seu Web Service `Evolu-oParadaFria3`, configure:

```
✅ Build Command: npm run build
✅ Start Command: npm start
✅ Node Version: 18.x (automático)
```

### 2. **Environment Variables (OBRIGATÓRIO)**

Acesse **Settings → Environment** e adicione:

```env
NODE_ENV=production
REACT_APP_GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
REACT_APP_ADMIN_USERNAME=admin
REACT_APP_ADMIN_PASSWORD=create_strong_password
REACT_APP_SUPER_USERNAME=super
REACT_APP_SUPER_PASSWORD=create_strong_password
REACT_APP_GUEST_USERNAME=guest
REACT_APP_GUEST_PASSWORD=create_strong_password
REACT_APP_DASHBOARD_TOKEN_PREFIX=dashboard_token
```

> **⚠️ IMPORTANTE:** Substitua os valores `your_*_here` e `create_strong_password` pelos seus valores reais!

### 3. **Health Check**

```
✅ Health Check Path: /healthz
```

### 4. **Auto-Deploy**

```
✅ Auto-Deploy: On (ativado)
✅ Branch: main
```

## 🔧 Processo de Deploy

### O que acontece automaticamente:

1. **📦 Install**: Instala dependências do backend e frontend
2. **🏗️ Build**: Compila o frontend React + backend TypeScript
3. **📁 Copy**: Copia arquivos do frontend para o backend
4. **🚀 Start**: Inicia o servidor backend que serve a aplicação

### URLs após deploy:

- **Frontend (React)**: `https://evolu-oparadafria3.onrender.com`
- **API Backend**: `https://evolu-oparadafria3.onrender.com/api/*`
- **Health Check**: `https://evolu-oparadafria3.onrender.com/healthz`

## ⚡ Como fazer deploy agora:

### Opção 1: Auto-Deploy (Recomendado)
- ✅ Já configurado! Qualquer push para `main` dispara deploy automático

### Opção 2: Manual Deploy  
1. Acesse o dashboard do Render
2. Vá em "Manual Deploy"
3. Clique em "Deploy latest commit"

## 🔍 Verificação pós-deploy:

### 1. Verifique os logs:
- Acesse **Logs** no dashboard do Render
- Procure por: `✅ Servidor rodando na porta XXXX`

### 2. Teste a aplicação:
```bash
# Health check
curl https://evolu-oparadafria3.onrender.com/healthz

# API test
curl https://evolu-oparadafria3.onrender.com/api/test

# Frontend (abrir no navegador)
https://evolu-oparadafria3.onrender.com
```

## ⚠️ Troubleshooting

### Build falha:
- Verifique se todas as Environment Variables estão configuradas
- Confirme que o Node.js version é compatível (18.x)

### App não carrega:
- Verifique logs no dashboard do Render
- Confirme se o health check está respondendo

### 502 Bad Gateway:
- Aguarde alguns minutos (cold start)
- Verifique se o processo está rodando na porta correta

## 🎯 Status do Deploy

- ✅ Código otimizado para produção
- ✅ Arquivos estáticos configurados
- ✅ Health check implementado
- ✅ Build scripts funcionais
- ✅ Environment variables mapeadas

**Próximo passo**: Configure as Environment Variables e faça o deploy! 🚀
