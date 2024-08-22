# Stage 1 - Instalação das dependências do Node.js
FROM node:20.16.0 as node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2 - Instalação e compilação do Python
FROM ubuntu:20.04 as python_builder
WORKDIR /app

# Instala dependências necessárias para compilar o Python
RUN apt-get update && \
    apt-get install -y \
    build-essential \
    libssl-dev \
    zlib1g-dev \
    libncurses5-dev \
    libgdbm-dev \
    libnss3-dev \
    libsqlite3-dev \
    libreadline-dev \
    libffi-dev \
    wget \
    libbz2-dev

# Baixa e compila o Python
RUN wget https://www.python.org/ftp/python/3.10.11/Python-3.10.11.tgz && \
    tar -xf Python-3.10.11.tgz && \
    cd Python-3.10.11 && \
    ./configure --enable-optimizations && \
    make -j $(nproc) && \
    make altinstall

# Instala as dependências do Python
RUN /usr/local/bin/python3.10 -m pip install --upgrade pip
COPY requirements.txt ./
RUN /usr/local/bin/python3.10 -m pip install -r requirements.txt

# Stage 3 - Construção da imagem final
FROM python:3.10
WORKDIR /app

# Copia as dependências instaladas do Node.js
COPY --from=node_builder /app /app

# Copia o Python compilado e suas dependências do estágio anterior
COPY --from=python_builder /usr/local/bin/python3.10 /usr/local/bin/
COPY --from=python_builder /usr/local/lib/python3.10 /usr/local/lib/python3.10

# Copia o código-fonte
COPY . .

# Instala as dependências do Python no estágio final (opcional)
RUN /usr/local/bin/python3.10 -m pip install -r requirements.txt

# Exponha a porta usada pelo Node.js
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "src/server.js"]
