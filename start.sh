#!/bin/bash

# Script multiplataforma para iniciar desenvolvimento
echo "🚀 Iniciando PF3-WEB em modo desenvolvimento..."

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verifica se Node.js está instalado
if ! command_exists node; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js primeiro."
    exit 1
fi

# Verifica se npm está instalado
if ! command_exists npm; then
    echo "❌ npm não encontrado. Por favor, instale npm primeiro."
    exit 1
fi

# Mata processos nas portas 3000 e 3001 (se existirem)
echo "🔄 Liberando portas 3000 e 3001..."

# Para sistemas Unix-like
if command_exists lsof; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
fi

# Para Windows (se estiver rodando no Git Bash)
if command_exists netstat; then
    netstat -ano | grep ":3000 " | awk '{print $5}' | xargs taskkill //f //pid 2>/dev/null || true
    netstat -ano | grep ":3001 " | awk '{print $5}' | xargs taskkill //f //pid 2>/dev/null || true
fi

sleep 2

# Verifica e instala dependências do projeto raiz
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do projeto raiz..."
    npm install
fi

# Verifica e instala dependências do backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

# Verifica e instala dependências do frontend
if [ ! -d "frontend/dashboard/node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    cd frontend/dashboard && npm install && cd ../..
fi

echo "✅ Todas as dependências verificadas!"
echo ""
echo "🌐 Aplicação será executada em:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "💡 Para parar: Ctrl+C"
echo ""

# Inicia ambos os serviços
npm run dev
