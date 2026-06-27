# Newsletter Inteligente - Backend

API REST + worker assincrono desenvolvidos em NestJS para o desafio da Newsletter Inteligente.

O foco essencial pedido no enunciado para o backend era:

- expor noticias via `GET /news`
- suportar paginacao
- suportar filtro por periodo `day|week|month`
- persistir noticias e categorias em banco

Hoje este backend entrega esse nucleo e tambem inclui itens bonus:
autenticacao com JWT, preferencias do usuario, agente curador high-code
rodando em worker separado com mensageria BullMQ/Redis e resumo automatico
com IA plugavel.

## Stack

- Node.js 20
- NestJS
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Docker Compose

## Decisoes tecnicas

### Banco de dados

Foi escolhido PostgreSQL.

Motivos:

- o dominio tem relacoes claras entre `users`, `categories`, `user_preferences`, `news` e `user_sessions`
- filtros, ordenacao e paginacao ficam simples e previsiveis em SQL
- consistencia relacional ajuda principalmente em preferencias e categorias
- Prisma funciona muito bem com esse modelo e acelera a implementacao

### ORM

Foi escolhido Prisma para:

- manter a modelagem tipada
- facilitar migrations e seed
- deixar a camada de acesso a dados mais simples de manter

### Autenticacao

Foi escolhido JWT com Nest Passport.

O backend usa:

- login com email e senha
- hash de senha com `bcrypt`
- guard global para proteger rotas privadas
- sessoes persistidas em `user_sessions` para permitir logout real

## Escopo atual do backend

### Essencial entregue

- `GET /news` com paginacao
- filtro por periodo em `GET /news?period=day|week|month`
- listagem de categorias/preferencias disponiveis
- seed inicial de categorias e noticias
- documentacao via Swagger

### Bonus ja implementado

- `POST /users` para cadastro
- `POST /login` para autenticacao
- `POST /logout` para encerrar a sessao atual
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- protecao das rotas privadas com JWT
- agente curador high-code rodando em worker separado
- mensageria assincrona com BullMQ + Redis (2 filas)
- consumidor que enriquece noticias com resumo via IA
- provedor de IA plugavel: `mock`, `openai`, `anthropic`, `openrouter`
- fallback automatico para resumo local se a IA falhar
- `GET /curation/runs/:id` para acompanhar progresso da curadoria
- rastreamento de itens processados, salvos e com falha por execucao

## Modelagem principal

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `created_at`
- `updated_at`

### `categories`

- `id`
- `name`
- `slug`
- `description`
- `created_at`
- `updated_at`

### `user_preferences`

Relaciona usuario com categorias escolhidas.

### `news`

- `id`
- `title`
- `source_name`
- `source_url`
- `url`
- `content`
- `summary`
- `sentiment`
- `entities`
- `published_at`
- `category_id`
- `created_at`
- `updated_at`

### `user_sessions`

Tabela de sessao usada para permitir logout real com JWT.

- `id`
- `user_id`
- `expires_at`
- `revoked_at`
- `created_at`
- `updated_at`

### `curation_runs`

Registra cada execucao do agente curador, com contadores de processamento.

- `id`
- `status` - `QUEUED` | `RUNNING` | `COMPLETED` | `PARTIAL` | `FAILED`
- `source_type` - origem das noticias (ex: `template`)
- `items_found`
- `items_queued`
- `items_processed`
- `items_saved`
- `items_failed`
- `error_message`
- `started_at`
- `finished_at`

## Estrutura de modulos

- `auth`: cadastro, login, logout, JWT e sessao
- `news`: listagem de noticias e filtros
- `preferences`: categorias disponiveis
- `users`: preferencias do usuario autenticado
- `queue`: configuracao das filas BullMQ (Redis)
- `curation`: agente curador, enriquecimento de noticias, processors BullMQ
- `ai`: servico de resumo com IA
- `health`: health check do banco
- `common`: paginacao, decorators, exceptions, validacoes e contratos compartilhados

## Arquitetura de diretorios

```text
src/
|-- common/          # decorators, exceptions, pagination, validation e contratos
|-- config/          # app config, validacao de env, swagger
|-- core/            # filtros e guards globais
|-- database/        # PrismaService, DatabaseModule, repository base
|-- modules/
|   |-- ai/          # provider strategy para resumo
|   |-- auth/        # login, logout, JWT e sessoes
|   |-- curation/    # agente, enrichment e processors BullMQ
|   |-- health/      # health check
|   |-- news/        # listagem e persistencia de noticias
|   |-- preferences/ # categorias disponiveis
|   |-- queue/       # filas e contratos de mensageria
|   `-- users/       # perfil e preferencias do usuario
|-- app.module.ts    # bootstrap HTTP
|-- main.ts          # inicializacao da API
|-- worker.module.ts # bootstrap do worker
`-- worker.ts        # inicializacao do worker
```

## Variaveis de ambiente

Use o arquivo `.env.example` como base.

Variaveis principais:

```env
NODE_ENV=development
PORT=3333

POSTGRES_DB=newsletter_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5433

DATABASE_URL="postgresql://postgres:postgres@localhost:5433/newsletter_db?schema=public"

JWT_SECRET="dev_secret_change_later"
JWT_EXPIRES_IN="1d"

REDIS_HOST=localhost
REDIS_PORT=6379

AI_PROVIDER=mock
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-3-5-haiku-latest"
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="google/gemini-2.0-flash-exp:free"
```

Observacao sobre ferramentas:

- a versao do `pnpm` esta fixada em `package.json` no campo `packageManager`
- isso garante que ambiente local, CI e Docker usem a mesma versao do gerenciador
- esse ajuste evita incompatibilidade entre a imagem Node 20 e versoes mais novas do `pnpm`

## Como rodar localmente

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Criar o `.env`

Copie os valores de `backend/.env.example` para `backend/.env`.

### 3. Subir banco e redis

```bash
docker compose up -d postgres redis
```

### 4. Aplicar migrations

```bash
pnpm prisma migrate dev
```

### 5. Popular o banco com dados iniciais

```bash
pnpm prisma:seed
```

### 6. Rodar a API

```bash
pnpm start:dev
```

### 7. Rodar o worker (em outro terminal)

```bash
pnpm start:worker
```

## Como rodar com Docker Compose

```bash
docker compose up --build
```

O compose sobe 4 containers: `api`, `worker`, `postgres` e `redis`.

Observacao: se estiver subindo tudo pela primeira vez, ainda e necessario aplicar migration e seed no banco:

```bash
docker compose exec api pnpm prisma migrate dev
docker compose exec api pnpm prisma:seed
```

No ambiente Docker:

- a API e o worker usam `postgres` e `redis` como hosts internos da rede do compose
- no ambiente local fora do Docker, o `.env` usa `localhost` para acesso ao Redis e ao Postgres publicados na maquina host

## Documentacao da API

Com a API rodando:

- Swagger: `http://localhost:3333/docs`

Para teste manual do fluxo completo, use o arquivo:

- `backend/http/curation-flow.http`

## Endpoints principais

### Publicos

- `GET /health`
- `POST /users`
- `POST /login`

### Protegidos por JWT

- `GET /me` - perfil do usuario autenticado
- `POST /logout`
- `GET /news`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- `POST /curation/run` - inicia uma execucao de curadoria
- `GET /curation/runs/:id` - consulta o progresso de uma execucao

## Exemplos de uso

Os exemplos abaixo tambem estao organizados no arquivo `backend/http/curation-flow.http`, que testa o fluxo completo do backend.

### Cadastro

```http
POST /users
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "strong-password",
  "confirmPassword": "strong-password"
}
```

### Login

```http
POST /login
Content-Type: application/json

{
  "email": "jane.doe@example.com",
  "password": "strong-password"
}
```

### Perfil do usuario autenticado

```http
GET /me
Authorization: Bearer <TOKEN>
```

### Noticias com filtro por periodo

```http
GET /news?page=1&limit=10&period=week
Authorization: Bearer <TOKEN>
```

### Atualizar preferencias do usuario

```http
PUT /users/me/preferences
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "categoryIds": [
    "<CATEGORY_ID_1>",
    "<CATEGORY_ID_2>"
  ]
}
```

### Disparar curadoria

```http
POST /curation/run
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "sourceType": "template",
  "limit": 5
}
```

### Acompanhar progresso da curadoria

```http
GET /curation/runs/<RUN_ID>
Authorization: Bearer <TOKEN>
```

O worker processa a descoberta e o enriquecimento de forma assincrona.
Consulte o status repetidamente ate ver `status: "COMPLETED"` ou `"PARTIAL"`.

## Fluxo de teste manual

O arquivo `backend/http/curation-flow.http` cobre o fluxo completo da aplicacao:

1. cadastro de usuario
2. login
3. perfil do usuario (`GET /me`)
4. consulta de noticias antes da curadoria
5. disparo de curadoria
6. consulta de status da execucao
7. noticias apos processamento

Basta abrir no VS Code com a extensao REST Client e executar as chamadas em sequencia.

Antes de rodar, garanta que:

- a API esta em execucao
- o banco ja recebeu as migrations
- o seed foi executado

Se quiser estender o roteiro manual, uma sequencia util e:

1. login
2. listar categorias em `GET /preferences`
3. consultar `GET /users/me/preferences`
4. atualizar preferencias do usuario
5. consultar noticias autenticadas
6. consultar noticias com filtro por categoria
7. fazer logout
8. validar rota bloqueada apos logout

## Testes

Neste momento o foco do projeto esta no fluxo funcional do desafio e na organizacao da codebase para facilitar a cobertura automatizada.

Os proximos testes naturais para adicionar sao:

- unitarios para `AiService`, `NewsService` e `CurationRunDomain`
- integracao para repositories principais com banco de teste
- e2e para autenticacao, preferencias, listagem de noticias e disparo da curadoria

## Comandos uteis

```bash
pnpm build
pnpm start:dev
pnpm start:worker
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm test
pnpm test:e2e
```

## Arquitetura do fluxo de curadoria

```text
POST /curation/run
       |
       v
   Cria CurationRun (QUEUED)
   Publica job em "curation-run"
       |
       v
   CurationRunProcessor (worker)
   |-- Marca run como RUNNING
   |-- CurationAgentService descobre noticias
   |-- Deduplica itens, persiste itemsQueued
   `-- Publica 1 job por item em "news-processing"
       |
       v
   NewsProcessingProcessor (worker)
   |-- Resolve categoria
   |-- AiService.summarize() -> resumo (mock | OpenAI | Anthropic | OpenRouter)
   |-- Detecta sentimento e extrai entidades
   |-- Salva no banco (NewsRepository.upsertCuratedNews)
   `-- Atualiza contadores da run (itemsProcessed / itemsSaved / itemsFailed)
       |
       v
   Run finaliza: COMPLETED | PARTIAL | FAILED
```

## Observacoes finais

- o backend compila com `pnpm build`
- o seed cria categorias e noticias de exemplo para desenvolvimento
- a autenticacao ja esta pronta para o frontend consumir
- a curadoria roda em worker separado com BullMQ + Redis
- a API dispara execucoes de curadoria e o worker processa descoberta e enriquecimento das noticias
- o resumo com IA e plugavel via variavel `AI_PROVIDER`
- se a IA externa falhar, o sistema faz fallback automatico para resumo local
