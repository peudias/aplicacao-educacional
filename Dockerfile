# Use uma imagem base com Python 3.10 e Node.js
FROM python:3.10.11-slim

# Instala o Node.js
RUN apt-get update && apt-get install -y nodejs npm

# Instala dependências necessárias
RUN apt-get install -y python3-pip python3.10-venv

# Cria e ativa um ambiente virtual
WORKDIR /app
RUN python3.10 -m venv venv
ENV PATH="/app/venv/bin:$PATH"

# Atualiza o pip
RUN pip install --upgrade pip

# Copia o requirements.txt e instala as dependências
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Instala dependências do Node.js
RUN npm install

# Expõe a porta da aplicação
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
