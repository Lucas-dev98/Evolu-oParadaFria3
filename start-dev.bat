@echo off
echo 🚀 Iniciando Backend e Frontend...

REM Mata processos Node.js existentes nas portas 3000 e 3001
echo 🔄 Verificando processos existentes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

REM Aguarda um momento para garantir que as portas foram liberadas
timeout /t 2 /nobreak >nul

echo 📦 Verificando dependências...

REM Verifica se node_modules existe no backend
if not exist "backend\node_modules" (
    echo 📦 Instalando dependências do backend...
    cd backend
    npm install
    cd ..
)

REM Verifica se node_modules existe no frontend
if not exist "frontend\dashboard\node_modules" (
    echo 📦 Instalando dependências do frontend...
    cd frontend\dashboard
    npm install
    cd ..\..
)

echo ✅ Dependências verificadas!
echo 🚀 Iniciando serviços...

REM Inicia ambos os serviços usando concurrently
npm run dev

pause
