FROM node:20-alpine

WORKDIR /app

# O projeto fixa a versão do pnpm em package.json via `packageManager`
# para garantir builds reproduzíveis no Docker e no ambiente local.
RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3333

CMD ["pnpm", "start:dev"]
