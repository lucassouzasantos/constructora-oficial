# Etapa 1: Build (Base Debian Slim para compatibilidade absoluta com AWS Graviton ARM64 e Prisma)
FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

# Importante para o Prisma no ARM64 da AWS
RUN apt-get update && apt-get install -y openssl

# Copia os manifestos de pacote e o Prisma primeiro
COPY package*.json ./
COPY prisma ./prisma/

# Instala todas as dependências
RUN npm install

# Copia o resto do código fonte do backend
COPY . .

# Gera o client do Supabase (Prisma) usando a engine compatível com ARM64
RUN npx prisma generate

# Constrói o aplicativo para produção na pasta /dist
RUN npm run build

# Etapa 2: Produção (Diminui radicalmente o tamanho do container rodando só o necessário)
FROM node:22-bookworm-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia apenas as coisas essenciais da fase 1
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Expõe as rotas do projeto do NestJS
EXPOSE 3000

# Executa o modo otimizado de produção
CMD ["npm", "run", "start:prod"]
