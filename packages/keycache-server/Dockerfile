FROM node:22-slim AS builder

WORKDIR /usr/KeyCache

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

FROM node:22-slim

WORKDIR /usr/KeyCache

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/KeyCache/dist ./dist
COPY public/ ./public/

EXPOSE 8000

CMD ["npm", "start"]
