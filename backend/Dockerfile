FROM node:20-alpine

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

EXPOSE ${PORT}

CMD ["pnpm", "start:dev"]