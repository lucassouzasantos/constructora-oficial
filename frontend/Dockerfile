# Etapa 1: Build (Compila o React/Vite para arquivos estáticos usando NodeJS)
FROM node:22-alpine AS builder

WORKDIR /app

# Instala as dependências
COPY package*.json ./
RUN npm install

# Copia os arquivos do frontend
COPY . .

# Aceita a variável de IP do backend vinda do Docker Compose na hora da construção
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Gera a pasta /dist com a aplicação pronta
RUN npm run build

# Etapa 2: Servidor Web Leve (Nginx)
FROM nginx:alpine

# Copia a aplicação construída para a pasta pública do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Insere a nossa configuração especial de rotas SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Abre a porta 80 para a internet padrão
EXPOSE 80

# Inicia o servidor Web
CMD ["nginx", "-g", "daemon off;"]
