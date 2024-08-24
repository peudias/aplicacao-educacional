# Use uma imagem base que inclua Node.js
FROM node:20-slim

# Instale o Python e outras dependências necessárias
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# Defina o diretório de trabalho na imagem
WORKDIR /app

# Crie um ambiente virtual
RUN python3 -m venv venv

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
