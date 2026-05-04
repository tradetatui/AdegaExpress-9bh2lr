# Stage 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm install          # ← LINHA CORRIGIDA

# Copia o restante do projeto e compila
COPY . .
RUN npm run build
