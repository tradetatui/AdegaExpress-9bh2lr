FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variáveis de ambiente
ENV PORT=3000
ENV DB_HOST=mysql-bebeuja
ENV DB_USER=root
ENV DB_PASS=Dellys79800@
ENV DB_NAME=jabebeu

EXPOSE 3000

CMD ["node", "server.js"]