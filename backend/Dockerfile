FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./
COPY backend/.nestcli.json ./.nestcli.json

RUN npx prisma generate
RUN npm run build && echo "BUILD SUCCESS" && ls -la dist/

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
