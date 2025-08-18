# 🚀 Scripts de Desenvolvimento - PF3-WEB

Este projeto contém vários scripts para facilitar o desenvolvimento, permitindo rodar o **backend** e **frontend** com um único comando.

## 📋 **Opções de Execução**

### **1. Comando NPM (Recomendado)**

```bash
npm run dev
```

**O que faz:**

- Inicia backend na porta 3001
- Inicia frontend na porta 3000
- Usa `concurrently` para rodar ambos simultaneamente
- Logs coloridos e organizados

### **2. Script PowerShell (Windows)**

```powershell
# Versão simples
.\dev.ps1

# OU versão com mais recursos
powershell -ExecutionPolicy Bypass -File dev.ps1
```

**O que faz:**

- Mata processos existentes nas portas 3000/3001
- Verifica e instala dependências automaticamente
- Inicia ambos os serviços

### **3. Script Batch (Windows)**

```cmd
start-dev.bat
```

**O que faz:**

- Versão Windows nativa
- Mata processos em conflito
- Verifica dependências
- Inicia desenvolvimento

### **4. Script Bash (Linux/Mac/Git Bash)**

```bash
chmod +x start.sh
./start.sh
```

**O que faz:**

- Multiplataforma
- Mata processos nas portas
- Verifica todas as dependências
- Inicia desenvolvimento

---

## 🔧 **Scripts NPM Disponíveis**

| Comando                | Descrição                               |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | **Inicia backend + frontend**           |
| `npm run dev:backend`  | Apenas backend (porta 3001)             |
| `npm run dev:frontend` | Apenas frontend (porta 3000)            |
| `npm run kill-ports`   | Mata processos nas portas 3000/3001     |
| `npm run clean-start`  | Mata processos + inicia desenvolvimento |
| `npm install`          | Instala dependências de ambos projetos  |
| `npm run build`        | Build completo para produção            |

---

## 🌐 **URLs de Desenvolvimento**

Após executar qualquer script:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Backend Health**: http://localhost:3001/api/health

---

## ⚠️ **Solução de Problemas**

### **Problema: "Port already in use"**

**Solução:**

```bash
# Opção 1: Use o comando que mata processos
npm run kill-ports

# Opção 2: Use o comando limpo
npm run clean-start

# Opção 3: Execute o script PowerShell
.\dev.ps1
```

### **Problema: "Dependencies not found"**

**Solução:**

```bash
# Instala todas as dependências
npm install

# OU individualmente
cd backend && npm install
cd frontend/dashboard && npm install
```

### **Problema: Scripts PowerShell não executam**

**Solução:**

```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# OU executar com bypass
powershell -ExecutionPolicy Bypass -File dev.ps1
```

---

## 🚀 **Início Rápido**

1. **Clone o repositório**
2. **Execute um comando:**

   ```bash
   # Mais simples
   npm run dev

   # OU se tiver problemas de porta
   npm run clean-start

   # OU no Windows
   .\dev.ps1
   ```

3. **Acesse**: http://localhost:3000

---

## 📊 **Logs e Monitoramento**

Os scripts mostram logs coloridos indicando:

- ✅ **Verde**: Sucesso/OK
- ⚠️ **Amarelo**: Avisos
- ❌ **Vermelho**: Erros
- 🔵 **Azul**: Backend logs
- 🟣 **Roxo**: Frontend logs

---

**💡 Dica**: Use `Ctrl+C` para parar todos os serviços.
