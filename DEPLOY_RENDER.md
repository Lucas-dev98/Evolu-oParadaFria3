# 🚀 Deploy no Render.com - Guia Completo

Este guia explica como fazer o deploy completo da aplicação PF3-WEB no Render.com com **persistência completa de dados**.

## 📋 **Resumo da Solução Implementada**

### ✅ **Problemas Resolvidos:**

- ❌ **Antes**: Dados salvos apenas no localStorage (perdidos entre usuários)
- ✅ **Agora**: Dados persistem no backend para todos os usuários
- ❌ **Antes**: Imagens não carregavam no Render
- ✅ **Agora**: Sistema robusto de resolução de caminhos de imagem
- ❌ **Antes**: Configuração manual para produção/desenvolvimento
- ✅ **Agora**: Detecção automática de ambiente

### 🏗️ **Arquitetura da Solução:**

```
Frontend (React) ←→ Backend APIs ←→ Arquivos JSON (Persistência)
     ↓                    ↓                    ↓
  localStorage     Express.js Server      data/*.json
   (backup)         (APIs CRUD)        (armazenamento)
```

---

## 🛠️ **APIs Implementadas**

### **1. Gerenciamento de Áreas**

- `GET /api/areas` - Lista todas as áreas
- `POST /api/areas/upload` - Upload de CSV de áreas
- `GET /api/areas/:id` - Detalhes de uma área específica

### **2. Cronograma**

- `POST /api/cronograma/upload` - Upload de cronograma
- `GET /api/cronograma` - Recupera cronograma salvo
- `DELETE /api/cronograma` - Limpa cronograma

### **3. Fases**

- `POST /api/fases/upload` - Upload de fases
- `GET /api/fases/:area` - Recupera fases por área
- `DELETE /api/fases` - Limpa todas as fases

### **4. Imagens**

- `GET /api/images/:imagePath` - Resolve caminhos de imagem para produção

---

## 🔧 **Configuração de Ambiente**

O sistema detecta automaticamente se está rodando em desenvolvimento ou produção:

```typescript
// Desenvolvimento: http://localhost:3001
// Produção Render: https://[app-name].onrender.com
const API_URL = window.location.hostname.includes('onrender.com')
  ? `https://${window.location.hostname}`
  : 'http://localhost:3001';
```

---

## 📦 **Deploy Automático**

### **Opção 1: Script Automático**

```bash
# Execute o script de deploy
chmod +x deploy-render.sh
./deploy-render.sh
```

### **Opção 2: Manual**

#### **1. Preparar Backend**

```bash
cd backend
npm install
npm run build
```

#### **2. Preparar Frontend**

```bash
cd frontend/dashboard
npm install
npm run build
node render-build.js  # Copia imagens e assets
```

#### **3. Estrutura de Produção**

```
production/
├── dist/              # Backend compilado
├── public/            # Frontend buildado
├── data/              # Persistência de dados
└── package.json       # Dependências de produção
```

---

## 🌐 **Configuração no Render.com**

### **1. Criar Novo Web Service**

- Conecte seu repositório GitHub
- Escolha "Web Service"
- Configure as variáveis:

### **2. Variáveis de Ambiente**

```
NODE_ENV=production
PORT=10000
```

### **3. Comandos de Build e Start**

```bash
# Build Command:
chmod +x deploy-render.sh && ./deploy-render.sh

# Start Command:
cd production && npm start
```

---

## 📊 **Fluxo de Dados Completo**

### **Upload de CSV (Admin)**

```
1. Admin faz upload → 2. Dados salvos no backend → 3. Disponível para todos os usuários
```

### **Visualização (Usuários)**

```
1. App carrega → 2. Busca dados no backend → 3. Exibe dados atualizados
```

### **Fallback LocalStorage**

```
Se backend indisponível → Usa localStorage como backup → Tenta sincronizar depois
```

---

## 🔍 **Verificação de Deploy**

### **Checklist Pós-Deploy:**

- [ ] ✅ Aplicação carrega na URL do Render
- [ ] ✅ Imagens do carousel aparecem corretamente
- [ ] ✅ Upload de CSV funciona (admin)
- [ ] ✅ Dados persistem entre sessões/usuários
- [ ] ✅ APIs respondem corretamente
- [ ] ✅ Logs não mostram erros de CORS

### **URLs para Testar:**

```
https://[seu-app].onrender.com/          # Frontend
https://[seu-app].onrender.com/api/areas # API de áreas
```

---

## 🐛 **Troubleshooting**

### **Problema: Imagens não carregam**

**Solução**: API `/api/images/:imagePath` resolve automaticamente

### **Problema: Dados não persistem**

**Verificar**:

1. Variável `NODE_ENV=production` está configurada?
2. Diretório `production/data/` foi criado?
3. APIs estão respondendo?

### **Problema: CORS errors**

**Solução**: Backend configurado com CORS para Render.com

### **Logs Úteis:**

```javascript
// Frontend - Console do navegador
console.log('API_URL:', API_CONFIG.BASE_URL);

// Backend - Logs do Render
console.log('Dados salvos em:', path);
```

---

## 📁 **Estrutura Final do Projeto**

```
PF3-WEB/
├── backend/
│   ├── dist/                 # Compilado TypeScript
│   ├── src/index.ts         # APIs + resolução de imagens
│   └── data/                # Persistência JSON
├── frontend/dashboard/
│   ├── build/               # Build React
│   ├── src/config/environment.ts  # Detecção ambiente
│   └── src/services/api.ts  # Cliente API
├── production/              # Deploy final
├── deploy-render.sh         # Script automático
└── render.yaml             # Configuração Render
```

---

## 🎯 **Próximos Passos**

1. **Commit e Push** dos arquivos modificados
2. **Conectar repositório** no Render.com
3. **Configurar variáveis** de ambiente
4. **Fazer primeiro deploy**
5. **Testar funcionalidades** completas
6. **Monitorar logs** para ajustes

---

**✨ Agora sua aplicação tem persistência completa e está pronta para produção no Render.com!**
