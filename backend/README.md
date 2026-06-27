# Newsletter Inteligente - Backend

API REST + Worker assíncrono desenvolvidos em NestJS para o desafio da Newsletter Inteligente.

O foco essencial pedido no enunciado para o backend era:

- expor notícias via `GET /news`
- suportar paginação
- suportar filtro por periodo `day|week|month`
- persistir notícias e categorias em banco

Hoje este backend entrega esse núcleo e também inclui os itens bônus:
autenticação com JWT, preferências do usuário, agente curador high-code
rodando em worker separado com mensageria BullMQ/Redis, e resumo automático
com IA plugável (mock, OpenAI, Anthropic).

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

- o domínio tem relações claras entre `users`, `categories`, `user_preferences`, `news` e `user_sessions`
- filtros, ordenação e paginação ficam simples e previsíveis em SQL
- consistência relacional ajuda principalmente em preferências e categorias
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
- sessões persistidas em `user_sessions` para permitir logout real

## Escopo atual do backend

### Essencial entregue

- `GET /news` com paginação
- filtro por periodo em `GET /news?period=day|week|month`
- listagem de categorias/preferências disponíveis
- seed inicial de categorias e notícias
- documentação via Swagger

### Bônus já implementado

- `POST /users` para cadastro
- `POST /login` para autenticação
- `POST /logout` para encerrar a sessão atual
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- proteção das rotas privadas com JWT
- agente curador high-code rodando em worker separado
- mensageria assíncrona com BullMQ + Redis (2 filas)
- consumidor que enriquece notícias com resumo via IA
- provedor de IA plugável: `mock`, `openai`, `anthropic`, `openrouter`
- fallback automático para resumo local se a IA falhar
- `GET /curation/runs/:id` para acompanhar progresso da curadoria
- rastreamento de itens processados, salvos e com falha por execução

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

Relaciona usuário com categorias escolhidas.

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

Tabela de sessão usada para permitir logout real com JWT.

- `id`
- `user_id`
- `expires_at`
- `revoked_at`
- `created_at`
- `updated_at`

### `curation_runs`

Registra cada execução do agente curador, com contadores de processamento.

- `id`
- `status` — `QUEUED` | `RUNNING` | `COMPLETED` | `PARTIAL` | `FAILED`
- `source_type` — origem das notícias (ex: `template`)
- `items_found`
- `items_queued`
- `items_processed`
- `items_saved`
- `items_failed`
- `error_message`
- `started_at`
- `finished_at`

## Estrutura de modulos

- `auth`: cadastro, login, logout, JWT e sessão
- `news`: listagem de notícias e filtros
- `preferences`: categorias disponíveis
- `users`: preferências do usuário autenticado
- `queue`: configuração das filas BullMQ (Redis)
- `curation`: agente curador, enriquecimento de notícias, processadores BullMQ
- `ai`: serviço de resumo com IA (mock, OpenAI, Anthropic)
- `health`: health check do banco
- `common`: paginação, decorators, exceptions e validações compartilhadas

## Variáveis de ambiente

Use o arquivo `.env.example` como base.

Variáveis principais:

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

AI_PROVIDER=mock                   # mock | openai | anthropic | openrouter
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-mini"
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL="claude-3-5-haiku-latest"
OPENROUTER_API_KEY=""              # https://openrouter.ai/keys
OPENROUTER_MODEL="google/gemini-2.0-flash-exp:free"
```

Observação sobre ferramentas:

- a versão do `pnpm` está fixada em `package.json` no campo `packageManager`
- isso garante que ambiente local, CI e Docker usem a mesma versão do gerenciador
- esse ajuste é importante para evitar incompatibilidade entre a imagem Node 20 e versões mais novas do `pnpm`

## Como rodar localmente

### 1. Instalar dependências

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

Observação: se estiver subindo tudo pela primeira vez, ainda é necessário aplicar migration e seed no banco:

```bash
docker compose exec api pnpm prisma migrate dev
docker compose exec api pnpm prisma:seed
```

No ambiente Docker:

- a API e o worker usam `postgres` e `redis` como hosts internos da rede do compose
- no ambiente local fora do Docker, o `.env` usa `localhost` para acesso ao Redis e ao Postgres publicados na máquina host

## Documentação da API

Com a API rodando:

- Swagger: `http://localhost:3333/docs`

Para teste manual do fluxo completo, o caminho mais prático deste projeto é usar o arquivo:

- `backend/http/auth-complete-flow.http`

## Endpoints principais

### Públicos

- `GET /`
- `GET /health`
- `POST /users`
- `POST /login`

### Protegidos por JWT

- `GET /me` — perfil do usuário autenticado
- `POST /logout`
- `GET /news`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- `POST /curation/run` — inicia uma execução de curadoria
- `GET /curation/runs/:id` — consulta o progresso de uma execução

## Exemplos de uso

Os exemplos abaixo também estão organizados no arquivo `backend/http/auth-complete-flow.http`, que pode ser usado para testar o backend do início ao fim.

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

### Perfil do usuário autenticado

```http
GET /me
Authorization: Bearer <TOKEN>
```

### Notícias com filtro por período

```http
GET /news?page=1&limit=10&period=week
Authorization: Bearer <TOKEN>
```

### Atualizar preferências do usuário

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

O worker processa a descoberta e o enriquecimento de forma assíncrona.
Consulte o status repetidamente até ver `status: "COMPLETED"` ou `"PARTIAL"`.

## Fluxo de teste manual

Os arquivos abaixo cobrem os fluxos de teste manual:

- `backend/http/auth-complete-flow.http` — cadastro, login, preferências, notícias, logout
- `backend/http/curation-flow.http` — login, curadoria, consulta de status e notícias após processamento

O fluxo recomendado para validar o backend é executar os dois arquivos em sequência.

Se estiver usando VS Code, basta abrir o arquivo com uma extensão compatível com requests HTTP, como REST Client, e executar as chamadas em sequência.

O arquivo já traz variáveis prontas para teste:

- `@baseUrl = http://localhost:3333`
- `@userName = User teste`
- `@userEmail = userteste@teste.com`
- `@userPassword = strong-password`

Antes de rodar o fluxo, garanta que:

- a API está em execução
- o banco já recebeu as migrations
- o seed foi executado, para que existam categorias disponíveis em `/preferences`

Esse arquivo cobre:

- acesso público
- tentativa sem token
- cadastro
- login
- listagem de categorias disponíveis em `GET /preferences`
- listagem de preferências
- atualização das preferências do usuário
- consulta de notícias autenticada
- consulta de notícias com filtro por categoria
- logout
- validação de rota bloqueada após logout

## Comandos úteis

```bash
pnpm build
pnpm start:dev          # API
pnpm start:worker       # Worker BullMQ (em terminal separado)
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm test
pnpm test:e2e
```

## Arquitetura do fluxo de curadoria

```
POST /curation/run
       │
       ▼
   Cria CurationRun (QUEUED)
   Publica job em "curation-run"
       │
       ▼
   CurationRunProcessor (worker)
   ├── Marca run como RUNNING
   ├── CurationAgentService descobre notícias
   ├── Deduplica itens, persiste itemsQueued
   └── Publica 1 job por item em "news-processing"
       │
       ▼
   NewsProcessingProcessor (worker)
   ├── Resolve categoria
   ├── AiService.summarize() → resumo (mock | OpenAI | Anthropic)
   ├── Detecta sentimento e extrai entidades
   ├── Salva no banco (NewsRepository.upsertCuratedNews)
   └── Atualiza contadores da run (itemsProcessed / itemsSaved / itemsFailed)
       │
       ▼
   Run finaliza: COMPLETED | PARTIAL | FAILED
```

## Observações finais

- o backend compila com `pnpm build`
- o seed cria categorias e notícias de exemplo para desenvolvimento
- a autenticação já está pronta para o frontend consumir
- a curadoria roda em worker separado com BullMQ + Redis
- a API dispara execuções de curadoria e o worker processa a descoberta e o enriquecimento das notícias
- o resumo com IA é plugável via variável `AI_PROVIDER` (mock, openai, anthropic, openrouter)
- se a IA externa falhar, o sistema faz fallback automático para resumo local
