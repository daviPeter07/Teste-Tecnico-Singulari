# Newsletter Inteligente

Aplicação full stack para o desafio da Newsletter Inteligente, com frontend em Next.js e backend em NestJS.

O projeto cobre o fluxo principal pedido no teste:

- backend servindo notícias com paginação e filtro por período
- frontend exibindo as notícias em SPA
- agente curador rodando em worker separado
- banco relacional com PostgreSQL
- filas assíncronas com Redis e BullMQ
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

## Módulos principais

### Frontend

- `auth`: login, cadastro, sessão e logout
- `news`: listagem, filtros e paginação
- `preferences`: leitura e edição de preferências

### Backend

- `auth`: cadastro, login, logout e JWT
- `news`: listagem pública de notícias
- `preferences` e `users`: preferências do usuário autenticado
- `curation`: agente, enriquecimento e acompanhamento de execução
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

Serviços expostos:

- frontend: `http://localhost:3000`
- backend: `http://localhost:3333`
- swagger: `http://localhost:3333/docs`
- postgres: `localhost:5433`
- redis: `localhost:6379`

### Frontend isolado

Com o backend já rodando em `localhost:3333`:

```bash
docker compose -f frontend/docker-compose.yml up --build
```

## Variáveis de ambiente

### Raiz

Use [.env.example](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/.env.example:1) como base para portas e variáveis compartilhadas do ambiente local.

### Backend

Use [backend/.env.example](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/backend/.env.example:1).

### Frontend

Use [frontend/.env.example](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/frontend/.env.example:1).

## Fluxo atual

```text
Frontend -> /api/* -> proxy do Next -> Backend
Backend -> PostgreSQL
Backend -> Redis/BullMQ
Worker -> Redis/BullMQ -> PostgreSQL
```

## Documentação complementar

- Backend: [backend/README.md](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/backend/README.md:1)
- Frontend: [frontend/README.md](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/frontend/README.md:1)
- Requisitos do desafio: [docs/teste_singu-desenvolvedor-pleno.extracted.txt](/C:/Users/Peterson/Desktop/projects/teste-singu-pleno/docs/teste_singu-desenvolvedor-pleno.extracted.txt:1)
