# Multi-stage build para otimizar o tamanho da imagem
FROM node:18-alpine AS frontend-builder

# Definir diretório de trabalho para o frontend
WORKDIR /app/frontend/dashboard

# Copiar package files do frontend
COPY frontend/dashboard/package*.json ./

# Instalar dependências do frontend
RUN npm ci --only=production

# Copiar código fonte do frontend
COPY frontend/dashboard/ ./

# Build do frontend
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine AS backend-builder

# Definir diretório de trabalho para o backend
WORKDIR /app/backend

# Copiar package files do backend
COPY backend/package*.json ./

# Instalar dependências do backend
RUN npm ci --only=production

# Copiar código fonte do backend
COPY backend/ ./

# Build do backend
RUN npm run build

# Stage 3: Production
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos necessários do backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package*.json ./

# Copiar o build do frontend para dentro do backend
COPY --from=frontend-builder /app/frontend/dashboard/build ./dist/frontend/dashboard/build

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta
EXPOSE $PORT

# Comando para iniciar a aplicação
CMD ["npm", "start"]
