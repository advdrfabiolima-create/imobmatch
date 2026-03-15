FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npx prisma generate
RUN npm run build
RUN ls -la dist/

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
