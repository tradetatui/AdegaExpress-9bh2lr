# ==============================================
# BebeuJá — Dockerfile para Easypanel / Docker
# ==============================================

# Stage 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm install

# Copia o restante do projeto e compila
COPY . .
RUN npm run build

# -----------------------------------------------

# Stage 2: Servidor estático simples (sem Nginx)
FROM node:20-alpine

WORKDIR /app

# Instala o serve globalmente
RUN npm install -g serve

# Copia o build gerado no estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta que o serve vai usar
EXPOSE 5173

# Comando para iniciar o servidor
CMD ["serve", "-s", "dist", "-l", "5173"]
