# --- Estágio 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependências primeiro (otimiza cache)
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante dos arquivos do projeto
COPY . .

# Executa o build (Vite gera a pasta 'dist')
RUN npm run build 

# --- Estágio 2: Produção ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]