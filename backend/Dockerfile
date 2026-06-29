FROM node:20-alpine

WORKDIR /app

# O projeto fixa a versão do pnpm em package.json via `packageManager`
# para garantir builds reproduzíveis no Docker e no ambiente local.
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
COPY docker/start-service.sh /usr/local/bin/start-service.sh

RUN chmod +x /usr/local/bin/start-service.sh

EXPOSE 3333

CMD ["start-service.sh"]
