# Use uma imagem base que inclua Node.js
FROM node:20-slim

# Instale o Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Copie os arquivos do projeto para o diretório de trabalho na imagem
COPY . .

# Instale as dependências do Node.js
RUN npm install

# Exponha a porta da aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
