FROM python:3.9-slim as python-builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

FROM node:20-slim

WORKDIR /app

COPY --from=python-builder /app /app

COPY . .

RUN npm install

EXPOSE 8080

CMD ["npm", "start"]
