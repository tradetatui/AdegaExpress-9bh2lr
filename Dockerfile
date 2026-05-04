# ==============================================
# BebeuJá — Dockerfile para Easypanel / Docker
# ==============================================

# Stage 1: Build da aplicação React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Copia dependências e instala
COPY package*.json ./
RUN npm ci --prefer-offline

# Copia o restante do projeto e compila
COPY . .
RUN npm run build

# -----------------------------------------------

# Stage 2: Servidor de produção com Nginx
FROM nginx:1.27-alpine

# Remove config padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia config personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia build gerado no estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
