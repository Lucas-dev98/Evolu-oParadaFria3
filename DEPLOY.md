# Deploy no Render - Guia Completo

## 📋 Configurações do Render

### Configurações Básicas:

- **Name:** `evolucao-parada-fria` (ou o nome que preferir)
- **Region:** Oregon (US West) - ou qualquer região de sua preferência
- **Branch:** `main`
- **Root Directory:** Deixe vazio (usar raiz do repositório)

### Build & Deploy:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Environment Variables (OBRIGATÓRIO):

```
NODE_ENV=production
REACT_APP_GOOGLE_GEMINI_API_KEY=sua_api_key_aqui
REACT_APP_ADMIN_USERNAME=seu_admin_username
REACT_APP_ADMIN_PASSWORD=sua_admin_password
REACT_APP_SUPER_USERNAME=seu_super_username
REACT_APP_SUPER_PASSWORD=sua_super_password
REACT_APP_GUEST_USERNAME=seu_guest_username
REACT_APP_GUEST_PASSWORD=sua_guest_password
REACT_APP_DASHBOARD_TOKEN_PREFIX=dashboard_token
```

### Health Check:

- **Health Check Path:** `/healthz`

### Instance Type:

- **Free:** Para testes ($0/mês)
- **Starter:** Para produção básica ($7/mês)
- **Standard:** Para uso profissional ($25/mês)

## 🚀 Passos para Deploy

### 1. Preparação do Repositório

1. Faça commit de todas as alterações
2. Push para o branch `main` no GitHub

### 2. Configuração no Render

1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Selecione "New Web Service"
4. Escolha o repositório `Evolu-oParadaFria3`
5. Configure conforme as especificações acima

### 3. Variáveis de Ambiente

⚠️ **IMPORTANTE:** Configure todas as variáveis de ambiente antes do deploy!

1. Na seção "Environment Variables", adicione todas as variáveis listadas acima
2. Substitua os valores pelas suas configurações reais
3. Mantenha `NODE_ENV=production`

### 4. Deploy

1. Clique em "Create Web Service"
2. Aguarde o processo de build (pode levar 5-10 minutos)
3. Se tudo correr bem, sua aplicação estará disponível na URL fornecida pelo Render

## 🔧 Estrutura do Projeto

```
/
├── package.json (configurações de build/start para Render)
├── render-build.js (script de build customizado)
├── Dockerfile (alternativa para deploy com Docker)
├── backend/
│   ├── src/index.ts (servidor Express + serve frontend)
│   └── package.json
└── frontend/dashboard/
    ├── src/
    └── package.json
```

## 🩺 Troubleshooting

### Build Falhou?

1. Verifique os logs no Render Dashboard
2. Certifique-se que todas as dependências estão no package.json
3. Verifique se as variáveis de ambiente estão configuradas

### Aplicação não Carrega?

1. Verifique o Health Check: `https://sua-app.onrender.com/healthz`
2. Verifique os logs do servidor
3. Certifique-se que o `NODE_ENV=production` está configurado

### Problemas com API?

1. Verifique se as variáveis de ambiente estão corretas
2. Teste as rotas da API diretamente: `https://sua-app.onrender.com/api/test`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Render Dashboard
2. Teste localmente com `npm run build && npm start`
3. Verifique se todas as variáveis de ambiente estão configuradas

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça suas alterações no código
2. Commit e push para o branch `main`
3. O Render fará o redeploy automaticamente
