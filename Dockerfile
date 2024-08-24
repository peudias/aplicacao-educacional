# Use uma imagem base que inclua Python 3.10.11 e Node.js
FROM python:3.10.11-slim

# Instale o Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Copie os arquivos do projeto para o diretório de trabalho na imagem
COPY . .

# Instale as dependências do Node.js
RUN npm install

# Instale as dependências do Python
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Exponha a porta da aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
