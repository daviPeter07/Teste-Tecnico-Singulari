# Newsletter Inteligente - Frontend

SPA em Next.js para a interface da newsletter.

O frontend cobre o essencial do desafio:

- mostrar notícias em uma interface web
- filtrar por período
- paginar a listagem
- consumir o backend real
- funcionar bem no desktop e no mobile

Também cobre bônus relevantes:

- login e cadastro
- sessão autenticada com cookie `HttpOnly`
- tela protegida de preferências
- edição de preferências do usuário
- organização modular por domínio e camada

## Stack

- Node.js 20+
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- nuqs
- Zod
- Biome

## Organização

Foi adotada uma estrutura modular por domínio.

- `auth`: login, cadastro, sessão e logout
- `news`: listagem, filtros, paginação e leitura de notícias
- `preferences`: leitura e atualização das preferências do usuário

Cada módulo concentra seus próprios `components`, `hooks`, `pages`, `queries`, `schemas`, `services` e `types`.

## Estrutura

```text
src/
|-- app/
|-- modules/
|   |-- auth/
|   |-- news/
|   `-- preferences/
`-- shared/
    |-- components/
    `-- lib/
```

## Ambiente

O frontend usa um caminho simples:

- `NEXT_PUBLIC_API_URL` recebe a URL pública se você quiser informar manualmente
- se ela não existir, o app usa `/api`

No modo com Docker, o `/api` é redirecionado pelo Next para o backend via `BACKEND_INTERNAL_URL`.

Exemplo:

```env
NEXT_PUBLIC_API_URL="/api"
BACKEND_INTERNAL_URL="http://localhost:3333"
```

Arquivos de exemplo:

- `frontend/.env.example`
- `.env.example`

## Como rodar

### Local

```bash
pnpm install
pnpm dev
```

### Docker só do frontend

Esse compose sobe apenas o frontend. O backend deve já estar rodando fora dele.

```bash
docker compose -f frontend/docker-compose.yml up --build
```

Por padrão ele tenta acessar o backend em `http://host.docker.internal:3333`.

### Docker do projeto completo

```bash
docker compose up --build
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm format
```

## Rotas

Públicas:

- `/`
- `/login`
- `/register`

Protegidas:

- `/preferences`

## Integrações

Públicas:

- `GET /news`
- `POST /users`
- `POST /login`

Autenticadas:

- `GET /me`
- `POST /logout`
- `GET /preferences`
- `GET /users/me/preferences`
- `PUT /users/me/preferences`

## Observações

- a IA não roda no frontend; ele apenas mostra os dados já preparados no backend
- o compose da raiz sobe o projeto completo
- o compose em `frontend/` existe para rodar a interface isoladamente
