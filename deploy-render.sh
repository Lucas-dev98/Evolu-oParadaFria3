#!/bin/bash

# Script de Deploy para Render.com
# Este script automatiza o processo completo de deploy

echo "🚀 Iniciando processo de deploy para Render..."

# 1. Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

# 2. Compilar TypeScript do backend
echo "🔨 Compilando TypeScript do backend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro na compilação do backend"
    exit 1
fi

# 3. Ir para o frontend
cd ../frontend/dashboard

# 4. Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

# 5. Build do frontend
echo "🔨 Fazendo build do frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro no build do frontend"
    exit 1
fi

# 6. Executar script de render-build (copia imagens, etc.)
echo "🖼️ Processando assets com render-build..."
node render-build.js
if [ $? -ne 0 ]; then
    echo "❌ Erro no render-build"
    exit 1
fi

# 7. Voltar para raiz do projeto
cd ../..

# 8. Criar diretório de produção se não existir
mkdir -p production

# 9. Copiar arquivos necessários para produção
echo "📁 Copiando arquivos para produção..."

# Copiar backend compilado
cp -r backend/dist production/
cp backend/package.json production/
cp backend/package-lock.json production/

# Copiar frontend buildado
cp -r frontend/dashboard/build production/public

# Copiar dados
cp -r backend/data production/ 2>/dev/null || echo "⚠️ Diretório data não encontrado, será criado automaticamente"

# 10. Criar package.json de produção
echo "📄 Criando package.json de produção..."
cat > production/package.json << EOF
{
  "name": "pf3-web-production",
  "version": "1.0.0",
  "description": "PF3 Web Application - Production Build",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "postinstall": "echo 'Production build ready'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "papaparse": "^5.4.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# 11. Criar arquivo de configuração do Render
echo "⚙️ Criando render.yaml..."
cat > render.yaml << EOF
services:
  - type: web
    name: pf3-web
    env: node
    buildCommand: chmod +x deploy-render.sh && ./deploy-render.sh
    startCommand: cd production && npm start
    plan: free
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
    autoDeploy: true
    branch: main
EOF

echo "✅ Deploy preparado com sucesso!"
echo ""
echo "📋 Estrutura de produção criada em: ./production/"
echo "🌐 Para fazer deploy no Render:"
echo "  1. Faça commit e push dos arquivos"
echo "  2. Conecte o repositório no Render.com"
echo "  3. O deploy será automático usando render.yaml"
echo ""
echo "🔍 Arquivos importantes:"
echo "  - production/dist/          (Backend compilado)"
echo "  - production/public/        (Frontend buildado)"
echo "  - production/package.json   (Dependências de produção)"
echo "  - render.yaml               (Configuração do Render)"
