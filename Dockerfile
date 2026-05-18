FROM node:20-alpine AS builder

WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npm run build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/tsconfig.json ./
COPY client/vite.config.ts ./
COPY client/index.html ./
COPY client/src ./src
RUN npm run build

FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist
COPY server/package*.json ./
COPY server/src ./server/src
COPY client/package*.json ./client/
COPY client/vite.config.ts ./client/
COPY client/index.html ./client/
COPY client/src ./client/src

ENV NODE_ENV=production

EXPOSE 5000

CMD ["sh", "-c", "cd server && npm start"]