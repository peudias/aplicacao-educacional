# Use uma imagem base que inclua Node.js e uma versão compatível de Python
FROM node:20-slim

# Instale Python 3.10
RUN apt-get update && apt-get install -y python3.10 python3.10-venv python3-pip

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Crie um ambiente virtual com Python 3.10
RUN python3.10 -m venv venv

# Ative o ambiente virtual e instale as dependências do Python
COPY requirements.txt .
RUN . ./venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# Copie os arquivos do projeto para o diretório de trabalho na imagem
COPY . .

# Instale as dependências do Node.js
RUN npm install

# Exponha a porta da aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
