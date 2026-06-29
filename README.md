# Newsletter Inteligente

Aplicação full stack para o desafio da Newsletter Inteligente, com frontend em Next.js e backend em NestJS.

O projeto cobre o núcleo essencial pedido no PDF:

- um backend que serve notícias
- um frontend que mostra essas notícias
- um agente curador rodando em worker separado

Além disso, também entrega bônus relevantes:

- login e cadastro
- sessão autenticada com JWT e cookie `HttpOnly`
- preferências do usuário
- mensageria com Redis e BullMQ
- resumo por IA no backend
- Docker Compose para subir o ambiente
- documentação consolidada

## Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, TanStack Query
- Backend: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- Infra: Docker Compose

## Organização do repositório

```text
.
|-- backend/
|-- docs/
|-- frontend/
|-- docker-compose.yml
`-- README.md
```

## Estrutura por aplicação

### Frontend

- `auth`: login, cadastro, sessão e logout
- `news`: listagem, filtros e paginação
- `preferences`: leitura e edição de preferências

### Backend

- `auth`: cadastro, login, logout e JWT
- `news`: listagem pública de notícias
- `preferences` e `users`: preferências do usuário autenticado
- `curation`: agente curador, enrichment e acompanhamento de execução
- `queue`: filas BullMQ
- `ai`: provedor de resumo
- `health`: health check

## Escopo atual do projeto

### Essencial entregue

- listagem de notícias com paginação
- filtro por período `day|week|month`
- frontend consumindo notícias reais
- worker separado para curadoria
- banco relacional com categorias e notícias

### Bônus já implementados

- autenticação com cadastro, login e logout
- preferências do usuário autenticado
- mensageria desacoplada com Redis e BullMQ
- resumo por IA no backend
- documentação do frontend, backend e repositório
- conteinerização do fluxo principal

## Diagrama

```text
┌──────────────┐
│   Frontend   │
│ Next.js SPA  │
└──────┬───────┘
       │ /api/*
       v
┌──────────────┐
│   Backend    │
│ NestJS API   │
└───┬────┬─────┘
    │    │
    │    └──────────────┐
    v                   v
┌──────────────┐   ┌──────────────┐
│ PostgreSQL   │   │ Redis/BullMQ │
└──────────────┘   └──────┬───────┘
                          v
                    ┌──────────────┐
                    │    Worker    │
                    │  Curadoria   │
                    └──────────────┘
```

## Como rodar

### Projeto completo pela raiz

Crie os arquivos de ambiente:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Depois suba tudo pela raiz:

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

### Backend isolado

Para rodar só o ambiente do backend, entre na pasta `backend/` e use o compose de lá:

```bash
cd backend
docker compose up --build
```

Esse fluxo sobe os serviços definidos dentro de `backend/docker-compose.yaml`.

### Frontend isolado

Para rodar só o frontend, entre na pasta `frontend/` e use o compose de lá:

```bash
cd frontend
docker compose up --build
```

Esse fluxo usa `frontend/docker-compose.yml`.

## Variáveis de ambiente

### Backend

Use `backend/.env.example`.

### Frontend

Use `frontend/.env.example`.

## Fluxo atual da aplicação

```text
Frontend -> /api/* -> proxy do Next -> Backend
Backend -> PostgreSQL
Backend -> Redis/BullMQ
Worker -> Redis/BullMQ -> PostgreSQL
```

## Documentação complementar

- Backend: `backend/README.md`
- Frontend: `frontend/README.md`
- Requisitos do desafio: `docs/teste_singu-desenvolvedor-pleno.extracted.txt`
- Resumos dos PRs: pasta `docs/`

## Observações importantes

- o backend real continua exposto em `localhost:3333`
- o frontend usa `/api` e delega o redirecionamento para o proxy do Next
- o resumo por IA e a mensageria ficam concentrados no backend e no worker
- os READMEs específicos de `backend/` e `frontend/` detalham melhor cada aplicação isoladamente
