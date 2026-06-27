# Newsletter Inteligente - Backend

API REST + worker assíncrono desenvolvidos em NestJS para o desafio da Newsletter Inteligente.

O backend cobre o núcleo essencial pedido no PDF:

- expor notícias via `GET /news`
- suportar paginação
- suportar filtro por período `day|week|month`
- persistir notícias e categorias em banco
- executar um agente curador high-code em worker separado

Além disso, também entrega bônus importantes:

- autenticação com JWT
- preferências do usuário
- mensageria com BullMQ + Redis
- enriquecimento assíncrono com resumo por IA
- testes unitários
- Docker Compose para API, worker, banco e Redis

## Stack

- Node.js 20
- NestJS
- Prisma
- PostgreSQL
- Redis
- BullMQ
- Docker Compose

## Decisões Técnicas

### Banco de dados

Foi escolhido PostgreSQL.

Motivos:

- o domínio tem relações claras entre `users`, `categories`, `user_preferences`, `news` e `user_sessions`
- filtros, ordenação e paginação ficam simples e previsíveis em SQL
- consistência relacional ajuda principalmente em preferências e categorias
- Prisma funciona muito bem com esse modelo e acelera a implementação

### ORM

Foi escolhido Prisma para:

- manter a modelagem tipada
- facilitar migrations e seed
- deixar a camada de acesso a dados simples de manter

### Autenticação

Foi escolhido JWT com Nest Passport.

O backend usa:

- login com e-mail e senha
- hash de senha com `bcrypt`
- guard global para proteger rotas privadas
- sessões persistidas em `user_sessions` para permitir logout real

### Mensageria

Foi escolhido BullMQ com Redis para desacoplar a etapa de descoberta da etapa de processamento/persistência.

Com isso:

- a API publica a execução de curadoria sem bloquear a camada HTTP
- o worker executa a descoberta em segundo plano
- cada notícia encontrada vira um job independente de processamento
- o consumidor enriquece, resume e salva a notícia no banco

## Escopo Atual do Backend

### Essencial entregue

- `GET /news` pública com paginação
- filtro por período em `GET /news?period=day|week|month`
- seed inicial de categorias e notícias
- agente curador high-code em worker separado

### Bônus já implementados

- `POST /users` para cadastro
- `POST /login` para autenticação
- `POST /logout` para encerrar a sessão atual
- `GET /me` para perfil autenticado
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- mensageria assíncrona com BullMQ + Redis
- consumidor que enriquece notícias com resumo via IA
- provider de IA plugável: `mock`, `openai`, `anthropic`, `openrouter`
- fallback automático para resumo local se a IA falhar
- `GET /curation/runs/:id` para acompanhar progresso
- rastreamento de itens processados, salvos e com falha por execução
- testes unitários cobrindo os principais serviços, providers e processors

## Agente Curador High-Code

O requisito obrigatório do desafio para o agente é atendido por um worker próprio em NestJS, sem uso de plataformas low-code/no-code.

Hoje o agente suporta duas estratégias explícitas de descoberta:

- `template` - gera notícias fictícias de tecnologia com base em templates determinísticos
- `local-json` - lê um arquivo JSON local com sinais operacionais e transforma esses insights em notícias

Exemplo de uso:

```http
POST /curation/run
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "sourceType": "local-json",
  "limit": 5
}
```

Com `local-json`, o agente interpreta sinais estruturados como variação de latência, adoção de IA, redução de bundle e queda no tempo de detecção de incidentes para produzir manchetes e corpo de notícia antes de publicar os itens na fila.

## Modelagem Principal

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
- `status` - `QUEUED` | `RUNNING` | `COMPLETED` | `PARTIAL` | `FAILED`
- `source_type` - origem das notícias (`template` ou `local-json`)
- `items_found`
- `items_queued`
- `items_processed`
- `items_saved`
- `items_failed`
- `error_message`
- `started_at`
- `finished_at`

## Estrutura de Módulos

- `auth`: cadastro, login, logout, JWT e sessões
- `news`: listagem de notícias e filtros
- `preferences`: categorias disponíveis
- `users`: preferências do usuário autenticado
- `queue`: configuração das filas BullMQ (Redis)
- `curation`: agente curador, enrichment e processors BullMQ
- `ai`: serviço de resumo com IA
- `health`: health check do banco
- `common`: paginação, decorators, exceptions, validações, interceptors e contratos compartilhados

## Arquitetura de Diretórios

```text
src/
|-- common/          # decorators, exceptions, interceptors, pagination, validation e contratos
|-- config/          # app config, validação de env, swagger
|-- core/            # pipes, filtros e guards globais
|-- database/        # PrismaService, DatabaseModule, repository base
|-- modules/
|   |-- ai/          # providers e seleção do resumidor
|   |-- auth/        # login, logout, JWT e sessões
|   |-- curation/    # run, sources, enrichment e processing
|   |-- health/      # health check
|   |-- news/        # listagem e persistência de notícias
|   |-- preferences/ # categorias disponíveis
|   |-- queue/       # filas e contratos de mensageria
|   `-- users/       # perfil e preferências do usuário
|-- app.module.ts    # bootstrap HTTP
|-- main.ts          # inicialização da API
|-- worker.module.ts # bootstrap do worker
`-- worker.ts        # inicialização do worker
```

## Variáveis de Ambiente

Use o arquivo `.env.example` como base.

Principais variáveis:

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
OPENAI_MODEL=""
ANTHROPIC_API_KEY=""
ANTHROPIC_MODEL=""
OPENROUTER_API_KEY=""
OPENROUTER_MODEL=""
```

Observações:

- a versão do `pnpm` está fixada em `package.json` no campo `packageManager`
- isso garante que ambiente local, CI e Docker usem a mesma versão do gerenciador
- no Docker, `REDIS_HOST` é sobrescrito para `redis`

## Como Rodar Localmente

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Criar o `.env`

Copie `backend/.env.example` para `backend/.env`.

### 3. Subir banco e Redis

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

## Como Rodar com Docker Compose

```bash
docker compose up --build
```

O compose sobe 4 containers: `api`, `worker`, `postgres` e `redis`.

Se estiver subindo tudo pela primeira vez, ainda é necessário aplicar migration e seed:

```bash
docker compose exec api pnpm prisma migrate dev
docker compose exec api pnpm prisma:seed
```

No ambiente Docker:

- a API e o worker usam `postgres` e `redis` como hosts internos da rede do compose
- fora do Docker, o `.env` usa `localhost`

## Documentação da API

Com a API rodando:

- Swagger: `http://localhost:3333/docs`

Para teste manual do fluxo completo, use:

- `backend/http/curation-flow.http`

## Endpoints Principais

### Públicos

- `GET /health`
- `GET /news`
- `POST /users`
- `POST /login`

### Protegidos por JWT

- `GET /me`
- `POST /logout`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`
- `POST /curation/run`
- `GET /curation/runs/:id`

## Exemplos de Uso

### Notícias com filtro por período

```http
GET /news?page=1&limit=10&period=week
```

Observações:

- `GET /news` é pública, como pedido no requisito essencial do desafio
- autenticação continua obrigatória apenas para perfil, preferências e disparo da curadoria

### Disparar curadoria

```http
POST /curation/run
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "sourceType": "local-json",
  "limit": 5
}
```

Valores aceitos em `sourceType`:

- `template`
- `local-json`

### Acompanhar progresso da curadoria

```http
GET /curation/runs/<RUN_ID>
Authorization: Bearer <TOKEN>
```

O worker processa a descoberta e o enriquecimento de forma assíncrona. Consulte o status repetidamente até ver `COMPLETED` ou `PARTIAL`.

Se `AI_PROVIDER=openrouter` estiver configurado, o consumidor usa o provider real para gerar o resumo antes de salvar a notícia no banco.

## Fluxo de Teste Manual

O arquivo `backend/http/curation-flow.http` cobre o fluxo completo da aplicação:

1. health check
2. consulta pública de notícias
3. filtro por período
4. cadastro
5. login
6. perfil autenticado
7. preferências
8. curadoria `template`
9. curadoria `local-json`
10. status das execuções
11. notícias após processamento
12. logout

## Testes

O backend conta com testes unitários cobrindo as regras de negócio mais críticas.

Cobertura principal atual:

- `AuthService`
- `UsersService`
- `CurationService`
- `QueueService`
- `CurationRunDomain`
- `CurationAgentService`
- `TemplateNewsSource`
- `LocalJsonNewsSource`
- `NewsEnrichmentService`
- `AiService`
- providers de IA (`mock`, `openai`, `anthropic`, `openrouter`)
- processors BullMQ (`CurationRunProcessor` e `NewsProcessingProcessor`)

Resultado atual da suíte unitária:

- `18` suítes passando
- `58` testes passando

Comandos:

```bash
pnpm test
pnpm test:cov
pnpm test:e2e
```

## Boas Práticas Aplicadas

- `ValidationPipe` global
- `JwtAuthGuard` global com `@Public()` para rotas abertas
- `ThrottlerGuard` global com limites específicos em rotas sensíveis
- `ParseUUIDPipe` em `GET /curation/runs/:id`
- interceptor de logging nas rotas de curadoria
- exception filter para exceções de domínio

## Arquitetura do Fluxo de Curadoria

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
   |-- CurationAgentService descobre notícias (`template` | `local-json`)
   |-- Deduplica itens e persiste itemsQueued
   `-- Publica 1 job por item em "news-processing"
       |
       v
   NewsProcessingProcessor (worker)
   |-- Resolve categoria
   |-- AiService.summarize() -> resumo (mock | OpenAI | Anthropic | OpenRouter)
   |-- Detecta sentimento e extrai entidades
   |-- Salva no banco
   `-- Atualiza contadores da run
       |
       v
   Run finaliza: COMPLETED | PARTIAL | FAILED
```

## Observações Finais

- o backend compila com `pnpm build`
- o seed cria categorias e notícias de exemplo para desenvolvimento
- a autenticação já está pronta para o frontend consumir
- a curadoria roda em worker separado com BullMQ + Redis
- a API dispara execuções de curadoria e o worker processa descoberta e enriquecimento das notícias
- o resumo com IA é plugável via variável `AI_PROVIDER`
- se a IA externa falhar, o sistema faz fallback automático para resumo local
