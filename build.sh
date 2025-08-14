#!/bin/bash

echo "🚀 Iniciando processo de build para produção..."

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
cd backend
npm install

# Voltar para raiz e instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
cd ../frontend/dashboard
npm install

# Build do frontend
echo "🏗️ Fazendo build do frontend..."
npm run build

# Voltar para o backend e fazer build
echo "🏗️ Fazendo build do backend..."
cd ../../backend
npm run build

# Copiar os arquivos do frontend build para dentro do backend dist
echo "📁 Copiando arquivos do frontend para o backend..."
mkdir -p dist/frontend/dashboard
cp -r ../frontend/dashboard/build dist/frontend/dashboard/

echo "✅ Build concluído com sucesso!"
