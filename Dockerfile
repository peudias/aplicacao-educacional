FROM python:3.9-slim

# Instala dependências necessárias
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-venv \
    && apt-get clean

WORKDIR /app

# Cria e ativa um ambiente virtual
RUN python3 -m venv venv
ENV PATH="/app/venv/bin:$PATH"

# Atualiza o pip
RUN pip install --upgrade pip

# Copia o requirements.txt e instala as dependências
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Instala dependências do Node.js
RUN apt-get install -y nodejs npm && npm install

# Exposição da porta
EXPOSE 8080

# Comando para iniciar a aplicação
CMD ["npm", "start"]
