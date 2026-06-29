# Newsletter Inteligente

Aplicacao full stack para o desafio da Newsletter Inteligente, com frontend em Next.js e backend em NestJS.

O projeto cobre o fluxo principal pedido no teste:

- backend servindo noticias com paginacao e filtro por periodo
- frontend exibindo as noticias em SPA
- agente curador rodando em worker separado
- banco relacional com PostgreSQL
- filas assincronas com Redis e BullMQ
- Docker Compose para subir o ambiente completo

## Estrutura

```text
.
|-- backend/
|-- docs/
|-- frontend/
|-- docker-compose.yml
`-- README.md
```

## Modulos principais

### Frontend

- `auth`: login, cadastro, sessao e logout
- `news`: listagem, filtros e paginacao
- `preferences`: leitura e edicao de preferencias

### Backend

- `auth`: cadastro, login, logout e JWT
- `news`: listagem publica de noticias
- `preferences` e `users`: preferencias do usuario autenticado
- `curation`: agente, enriquecimento e acompanhamento de execucao
- `queue`: filas BullMQ
- `ai`: provedor de resumo
- `health`: health check

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query
- Backend: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- Infra: Docker Compose

## Como rodar

### Projeto completo com Docker

1. Crie os arquivos de ambiente:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Suba tudo:

```bash
docker compose down --remove-orphans
docker compose up -d --build
```

Servicos expostos:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3333`
- swagger: `http://localhost:3333/docs`
- postgres: `localhost:5433`
- redis: `localhost:6379`

### Frontend isolado

Com o backend ja rodando em `localhost:3333`:

```bash
docker compose -f frontend/docker-compose.yml up --build
```

## Variaveis de ambiente

### Raiz

Use `.env.example` como base para portas e variaveis compartilhadas do ambiente local.

### Backend

Use `backend/.env.example`.

### Frontend

Use `frontend/.env.example`.

## Fluxo atual

```text
Frontend -> /api/* -> proxy do Next -> Backend
Backend -> PostgreSQL
Backend -> Redis/BullMQ
Worker -> Redis/BullMQ -> PostgreSQL
```

## Documentacao complementar

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Requisitos do desafio: `docs/teste_singu-desenvolvedor-pleno.extracted.txt`
