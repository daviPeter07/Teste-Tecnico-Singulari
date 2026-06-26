# Newsletter Inteligente - Backend

API REST desenvolvida em NestJS para o desafio da Newsletter Inteligente.

O foco essencial pedido no enunciado para o backend era:

- expor notícias via `GET /news`
- suportar paginação
- suportar filtro por periodo `day|week|month`
- persistir notícias e categorias em banco

Hoje este backend entrega esse núcleo e também já inclui parte dos itens bônus, como autenticação e preferências do usuário.

## Stack

- Node.js 20
- NestJS
- Prisma
- PostgreSQL
- Redis
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

### Ainda fora deste serviço

Os pontos abaixo fazem parte do desafio completo, mas ainda não estão implementados neste backend:

- agente curador separado
- mensageria com produtor/consumidor
- resumo com IA
- testes automatizados completos

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

## Estrutura de modulos

- `auth`: cadastro, login, logout, JWT e sessão
- `news`: listagem de notícias e filtros
- `preferences`: categorias disponíveis
- `users`: preferências do usuário autenticado
- `common`: paginação, decorators, exceptions e validações compartilhadas

## Variaveis de ambiente

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

REDIS_HOST=redis
REDIS_PORT=6379
```

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

## Como rodar com Docker Compose

```bash
docker compose up --build
```

Observação: se estiver subindo tudo pela primeira vez, ainda é necessário aplicar migration e seed no banco.

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

- `POST /logout`
- `GET /news`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`

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

## Fluxo de teste manual

O usuário pode testar o backend diretamente pelo arquivo:

- `backend/http/auth-complete-flow.http`

Esse é o fluxo recomendado para validar a API manualmente.

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
pnpm start:dev
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma:seed
pnpm test
pnpm test:e2e
```

## Observações finais

- o backend compila com `pnpm build`
- o seed cria categorias e notícias de exemplo para desenvolvimento
- a autenticação já está pronta para o frontend consumir
- o próximo passo natural do desafio, no backend, é o agente curador separado
