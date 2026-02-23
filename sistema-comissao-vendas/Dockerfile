# --- Estágio 1: Build (Compilação do Frontend) ---
# Usa uma imagem Node.js para construir o projeto React/Vite/TS
FROM node:20-alpine AS builder

WORKDIR /app

# Copia e instala as dependências
COPY package.json package-lock.json .env.production ./
RUN npm install

# Copia os arquivos do projeto
COPY . .

# Executa o build da aplicação (Vite gera a pasta 'dist')
RUN npm run build 

# --- Estágio 2: Produção (Servir os arquivos estáticos com Nginx) ---
# Usa a imagem oficial do Nginx
FROM nginx:alpine

# Copia os arquivos estáticos da pasta 'dist' gerada no estágio 'builder'
# O Nginx serve arquivos por padrão de /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia um arquivo de configuração Nginx customizado (opcional, mas recomendado para SPAs)
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# A porta 80 é a porta padrão do Nginx dentro do contêiner
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]