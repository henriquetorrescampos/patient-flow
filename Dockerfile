FROM node:20-slim

WORKDIR /usr/src/app

# 1️⃣ Instala o OpenSSL (necessário para o Prisma)
RUN apt-get update && apt-get install -y openssl

# 2️⃣ Copia apenas os arquivos de dependências primeiro (melhora o cache)
COPY package*.json ./

# 3️⃣ Instala as dependências
RUN npm install

# 4️⃣ Copia o restante do código
COPY . .

# 5️⃣ Gera o Prisma Client dentro do container (compatível com Linux ARM64)
RUN npx prisma generate --schema=backend/prisma/schema.prisma

EXPOSE 8080

# 6️⃣ Comando padrão
CMD ["npm", "start"]
